const { Session, Reaction, Question } = require('../models');
const { asyncHandler } = require('../middleware');

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

  res.status(200).json({
    success: true,
    data: analytics
  });
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

module.exports = {
  getSessionAnalytics,
  getRealtimeStats
};