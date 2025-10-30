const { Session, Reaction, Question } = require('../models');

// Socket.io orchestration for live session features
class SocketService {
  constructor(io) {
    this.io = io;
    this.sessions = new Map(); // sessionId -> Set of socket IDs
  }

  initialize() {
    // Register all socket event handlers
    this.io.on('connection', (socket) => {
      console.log('🔌 New client connected:', socket.id);

      // Join session room
      socket.on('join:session', async (data) => {
        await this.handleJoinSession(socket, data);
      });

      // Leave session room
      socket.on('leave:session', async (data) => {
        await this.handleLeaveSession(socket, data);
      });

      // Admin join control panel (do not affect viewer count)
      // Admin joins room to receive updates without incrementing viewers
      socket.on('admin:join', async ({ sessionId }) => {
        try {
          if (!sessionId) return;
          const session = await Session.findById(sessionId);
          if (!session) return;
          // Join the session room to receive all broadcasts without tracking as a viewer
          socket.join(sessionId);
          socket.adminSessionId = sessionId;
          console.log(`👑 Admin joined control panel for session ${sessionId}`);
        } catch (err) {
          console.error('Error in admin:join', err);
        }
      });

      // Admin leave control panel
      socket.on('admin:leave', ({ sessionId }) => {
        try {
          if (!sessionId) return;
          socket.leave(sessionId);
          delete socket.adminSessionId;
        } catch (err) {
          console.error('Error in admin:leave', err);
        }
      });

      // Send reaction
      // Viewer sends a quick reaction (❤️ 🔥 etc.)
      socket.on('reaction:send', async (data) => {
        await this.handleReaction(socket, data);
      });

      // Send question
      socket.on('question:send', async (data) => {
        await this.handleQuestion(socket, data);
      });

      // Answer question (admin)
      socket.on('question:answer', async (data) => {
        await this.handleAnswerQuestion(socket, data);
      });

      // Like question
      socket.on('question:like', async (data) => {
        await this.handleLikeQuestion(socket, data);
      });

      // Product highlight (admin)
      // Persist and broadcast which product is currently highlighted
      socket.on('product:highlight', async ({ sessionId, productId }) => {
        try {
          if (!sessionId) return;
          const session = await Session.findById(sessionId);
          if (!session) return;

          // Persist highlight on the session
          session.highlightedProduct = productId || null;
          await session.save();

          // Broadcast to all viewers
          this.io.to(sessionId).emit('product:highlighted', { productId: session.highlightedProduct });
          console.log(`🟡 Product highlight update in ${sessionId}:`, session.highlightedProduct);
        } catch (err) {
          console.error('Error in product:highlight', err);
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  async handleJoinSession(socket, data) {
    try {
      const { sessionId, userName = 'Anonymous' } = data;

      if (!sessionId) {
        socket.emit('error', { message: 'Session ID is required' });
        return;
      }

      // Verify session exists and is live
      const session = await Session.findById(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      if (session.status !== 'live') {
        socket.emit('error', { message: 'Session is not live' });
        return;
      }

      // Join room
      socket.join(sessionId);
      socket.sessionId = sessionId;
      socket.userName = userName;

      // Track viewers
      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, new Set());
      }
      this.sessions.get(sessionId).add(socket.id);

      // Update viewer count
      const viewerCount = this.sessions.get(sessionId).size;
      await session.updateViewerCount(viewerCount);

      // Broadcast updated viewer count
      this.io.to(sessionId).emit('viewers:update', {
        count: viewerCount,
        peakViewers: session.peakViewers
      });

      console.log(`✅ ${userName} joined session ${sessionId}. Viewers: ${viewerCount}`);

      socket.emit('session:joined', {
        sessionId,
        session,
        viewerCount
      });
    } catch (error) {
      console.error('Error in handleJoinSession:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  }

  async handleLeaveSession(socket, data) {
    try {
      const { sessionId } = data;
      
      if (!sessionId || !this.sessions.has(sessionId)) {
        return;
      }

      socket.leave(sessionId);
      this.sessions.get(sessionId).delete(socket.id);

      const viewerCount = this.sessions.get(sessionId).size;

      // Update viewer count in database
      const session = await Session.findById(sessionId);
      if (session) {
        await session.updateViewerCount(viewerCount);

        // Broadcast updated viewer count
        this.io.to(sessionId).emit('viewers:update', {
          count: viewerCount,
          peakViewers: session.peakViewers
        });
      }

      console.log(`👋 User left session ${sessionId}. Viewers: ${viewerCount}`);

      // Clean up if no viewers
      if (viewerCount === 0) {
        this.sessions.delete(sessionId);
      }
    } catch (error) {
      console.error('Error in handleLeaveSession:', error);
    }
  }

  async handleReaction(socket, data) {
    try {
      const { sessionId, type, userName = 'Anonymous' } = data;

      if (!sessionId || !type) {
        socket.emit('error', { message: 'Session ID and reaction type are required' });
        return;
      }

      // Verify session is live
      const session = await Session.findById(sessionId);
      if (!session || session.status !== 'live') {
        socket.emit('error', { message: 'Session is not live' });
        return;
      }

      // Save reaction to database
      const reaction = await Reaction.create({
        sessionId,
        type,
        userId: socket.id,
        userName
      });

      // Update session reaction count
      session.totalReactions += 1;
      await session.save();

      // Broadcast reaction to all viewers in the session
      this.io.to(sessionId).emit('reaction:new', {
        id: reaction._id,
        type,
        userName,
        timestamp: reaction.createdAt
      });

      console.log(`❤️ ${userName} reacted with ${type} in session ${sessionId}`);
    } catch (error) {
      console.error('Error in handleReaction:', error);
      socket.emit('error', { message: 'Failed to send reaction' });
    }
  }

  async handleQuestion(socket, data) {
    try {
      const { sessionId, question, userName = 'Anonymous' } = data;

      if (!sessionId || !question) {
        socket.emit('error', { message: 'Session ID and question are required' });
        return;
      }

      // Verify session is live
      const session = await Session.findById(sessionId);
      if (!session || session.status !== 'live') {
        socket.emit('error', { message: 'Session is not live' });
        return;
      }

      // Save question to database
      const newQuestion = await Question.create({
        sessionId,
        question,
        userId: socket.id,
        userName
      });

      // Update session question count
      session.totalQuestions += 1;
      await session.save();

      // Broadcast question to all viewers
      this.io.to(sessionId).emit('question:new', {
        id: newQuestion._id,
        question: newQuestion.question,
        userName: newQuestion.userName,
        isAnswered: false,
        likes: 0,
        timestamp: newQuestion.createdAt
      });

      // Also emit to admin control panel room if used elsewhere
      this.io.to(`admin-${sessionId}`).emit('question:new', {
        id: newQuestion._id,
        question: newQuestion.question,
        userName: newQuestion.userName,
        isAnswered: false,
        likes: 0,
        timestamp: newQuestion.createdAt
      });

      console.log(`❓ ${userName} asked: "${question}" in session ${sessionId}`);

      socket.emit('question:sent', { success: true });
    } catch (error) {
      console.error('Error in handleQuestion:', error);
      socket.emit('error', { message: 'Failed to send question' });
    }
  }

  async handleAnswerQuestion(socket, data) {
    try {
      const { questionId, answer } = data;

      if (!questionId || !answer) {
        socket.emit('error', { message: 'Question ID and answer are required' });
        return;
      }

      // Find and update question
      const question = await Question.findById(questionId);
      if (!question) {
        socket.emit('error', { message: 'Question not found' });
        return;
      }

      question.isAnswered = true;
      question.answer = answer;
      await question.save();

      // Broadcast answered question
      this.io.to(question.sessionId.toString()).emit('question:answered', {
        id: question._id,
        question: question.question,
        answer: question.answer,
        userName: question.userName,
        isAnswered: true,
        likes: question.likes,
        timestamp: question.createdAt
      });

      console.log(`✅ Question ${questionId} answered`);
    } catch (error) {
      console.error('Error in handleAnswerQuestion:', error);
      socket.emit('error', { message: 'Failed to answer question' });
    }
  }

  async handleLikeQuestion(socket, data) {
    try {
      const { questionId } = data;

      if (!questionId) {
        socket.emit('error', { message: 'Question ID is required' });
        return;
      }

      const question = await Question.findById(questionId);
      if (!question) {
        socket.emit('error', { message: 'Question not found' });
        return;
      }

      question.likes += 1;
      await question.save();

      // Broadcast like update
      this.io.to(question.sessionId.toString()).emit('question:liked', {
        id: question._id,
        likes: question.likes
      });
    } catch (error) {
      console.error('Error in handleLikeQuestion:', error);
      socket.emit('error', { message: 'Failed to like question' });
    }
  }

  handleDisconnect(socket) {
    console.log('❌ Client disconnected:', socket.id);

    // Remove from all sessions
    if (socket.sessionId && this.sessions.has(socket.sessionId)) {
      this.sessions.get(socket.sessionId).delete(socket.id);
      
      const viewerCount = this.sessions.get(socket.sessionId).size;

      // Update viewer count
      Session.findById(socket.sessionId).then(session => {
        if (session) {
          session.updateViewerCount(viewerCount).then(() => {
            this.io.to(socket.sessionId).emit('viewers:update', {
              count: viewerCount,
              peakViewers: session.peakViewers
            });
          });
        }
      });

      // Clean up
      if (viewerCount === 0) {
        this.sessions.delete(socket.sessionId);
      }
    }
  }

  // Get current viewers for a session
  getViewerCount(sessionId) {
    return this.sessions.has(sessionId) ? this.sessions.get(sessionId).size : 0;
  }
}

module.exports = SocketService;