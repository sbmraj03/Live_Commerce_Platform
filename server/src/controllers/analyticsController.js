const { Session, Reaction, Question } = require('../models');
const { asyncHandler } = require('../middleware');
const { generateText } = require('../services/geminiService');

// @desc    Get session analytics
// @route   GET /api/analytics/session/:id
// @access  Public
const getSessionAnalytics = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;

  const session = await Session.findById(sessionId).populate('products');
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  // Get reaction counts by type
  const reactions = await Reaction.aggregate([
    { $match: { sessionId: session._id } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const reactionStats = reactions.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // Get questions
  const questions = await Question.find({ sessionId })
    .sort({ likes: -1, createdAt: -1 })
    .limit(10);

  const analytics = {
    session: {
      id: session._id,
      title: session.title,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime
    },
    viewers: {
      current: session.viewerCount,
      peak: session.peakViewers
    },
    engagement: {
      totalReactions: session.totalReactions,
      reactionBreakdown: reactionStats,
      totalQuestions: session.totalQuestions,
      answeredQuestions: questions.filter(q => q.isAnswered).length
    },
    topQuestions: questions,
    products: session.products
  };

  res.status(200).json({ success: true, data: analytics });
});

// @desc    Get real-time session stats
// @route   GET /api/analytics/session/:id/realtime
// @access  Public
const getRealtimeStats = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const { socketService } = req.app.settings;

  const session = await Session.findById(sessionId);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  // Get current viewer count from socket service
  const currentViewers = socketService.getViewerCount(sessionId);

  // Get recent reactions (last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentReactions = await Reaction.countDocuments({
    sessionId,
    createdAt: { $gte: fiveMinutesAgo }
  });

  // Get recent questions
  const recentQuestions = await Question.find({
    sessionId,
    createdAt: { $gte: fiveMinutesAgo }
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      currentViewers,
      peakViewers: session.peakViewers,
      recentReactions,
      recentQuestions: recentQuestions.length,
      status: session.status
    }
  });
});

// @desc    AI insight for a session (short mood/summary)
// @route   POST /api/analytics/session/:id/insight
// @access  Private (admin) or Public depending on use-case; leaving public for demo
const getSessionInsight = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const session = await Session.findById(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const reactions = await Reaction.aggregate([
    { $match: { sessionId: session._id } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  const reactionBreakdown = reactions.reduce((acc, curr) => {
    acc[curr._id] = curr.count; return acc;
  }, {});

  const recentQuestions = await Question.find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(10);

  const prompt = `You are a helpful analytics assistant. Based on the following live-commerce session stats, write a very short 2-3 sentence summary of how the session is going and the audience mood (positive/neutral/negative). Provide direct, plain text with no markdown.

Session title: ${session.title}
Status: ${session.status}
Current viewers: ${session.viewerCount}
Peak viewers: ${session.peakViewers}
Reaction breakdown (type:count): ${JSON.stringify(reactionBreakdown)}
Recent top questions: ${recentQuestions.map(q => ({ question: q.question, likes: q.likes, answered: q.isAnswered }))}
`;

  try {
    const text = await generateText(prompt);
    res.json({ success: true, data: { insight: text } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to generate AI insight' });
  }
});

module.exports = {
  getSessionAnalytics,
  getRealtimeStats,
  getSessionInsight
};