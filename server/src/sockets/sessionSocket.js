// Legacy socket handlers (replaced by services/socketService.js). Kept for reference.
const Session = require('../models/Session');
const Question = require('../models/Question');

// Simple in-memory tracking of viewers per session
const activeSessions = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join session as viewer
    socket.on('join:session', async ({ sessionId, userName }) => {
      try {
        const session = await Session.findById(sessionId);
        if (!session || session.status !== 'live') {
          socket.emit('error', { message: 'Session not found or not live' });
          return;
        }

        // Join room
        socket.join(sessionId);
        socket.sessionId = sessionId;
        socket.userName = userName;

        // Track viewer
        if (!activeSessions.has(sessionId)) {
          activeSessions.set(sessionId, new Set());
        }
        activeSessions.get(sessionId).add(socket.id);

        const viewerCount = activeSessions.get(sessionId).size;

        // Update peak viewers if needed
        if (viewerCount > session.peakViewers) {
          session.peakViewers = viewerCount;
          await session.save();
        }

        // Emit to viewer
        socket.emit('session:joined', {
          sessionId,
          viewerCount,
          session
        });

        // Broadcast viewer update to all in room
        io.to(sessionId).emit('viewers:update', {
          count: viewerCount,
          peakViewers: session.peakViewers
        });

        console.log(`${userName} joined session ${sessionId}. Total viewers: ${viewerCount}`);
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Admin join
    socket.on('admin:join', ({ sessionId }) => {
      socket.join(`admin-${sessionId}`);
      console.log(`Admin joined control panel for session ${sessionId}`);
    });

    // Admin leave
    socket.on('admin:leave', ({ sessionId }) => {
      socket.leave(`admin-${sessionId}`);
    });

    // Leave session
    socket.on('leave:session', async ({ sessionId }) => {
      if (activeSessions.has(sessionId)) {
        activeSessions.get(sessionId).delete(socket.id);
        const viewerCount = activeSessions.get(sessionId).size;

        // Broadcast viewer update
        io.to(sessionId).emit('viewers:update', {
          count: viewerCount
        });

        console.log(`User left session ${sessionId}. Remaining viewers: ${viewerCount}`);
      }
    });

    // Send reaction
    socket.on('reaction:send', async ({ sessionId, type, userName }) => {
      try {
        const session = await Session.findById(sessionId);
        if (session) {
          session.totalReactions += 1;
          await session.save();

          // Broadcast reaction to all viewers
          io.to(sessionId).emit('reaction:new', {
            type,
            userName,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error sending reaction:', error);
      }
    });

    // Send question
    socket.on('question:send', async ({ sessionId, question, userName }) => {
      try {
        const session = await Session.findById(sessionId);
        if (!session) {
          socket.emit('question:sent', { success: false, message: 'Session not found' });
          return;
        }

        const newQuestion = new Question({
          session: sessionId,
          userName,
          question,
          timestamp: new Date()
        });

        await newQuestion.save();

        session.totalQuestions += 1;
        await session.save();

        const questionData = {
          id: newQuestion._id,
          userName,
          question,
          likes: 0,
          isAnswered: false,
          timestamp: newQuestion.timestamp
        };

        // Emit to sender
        socket.emit('question:sent', { success: true });

        // Broadcast to all viewers
        io.to(sessionId).emit('question:new', questionData);

        // Send to admin control panel
        io.to(`admin-${sessionId}`).emit('question:new', questionData);

        console.log(`New question in session ${sessionId}:`, question);
      } catch (error) {
        console.error('Error sending question:', error);
        socket.emit('question:sent', { success: false, message: 'Failed to send question' });
      }
    });

    // Answer question
    socket.on('question:answer', async ({ questionId, answer }) => {
      try {
        const question = await Question.findById(questionId);
        if (question) {
          question.isAnswered = true;
          question.answer = answer;
          await question.save();

          const updatedQuestion = {
            id: question._id,
            userName: question.userName,
            question: question.question,
            likes: question.likes,
            isAnswered: true,
            answer,
            timestamp: question.timestamp
          };

          // Broadcast to all viewers
          io.to(question.session.toString()).emit('question:answered', updatedQuestion);

          console.log(`Question ${questionId} answered`);
        }
      } catch (error) {
        console.error('Error answering question:', error);
      }
    });

    // Like question
    socket.on('question:like', async ({ questionId }) => {
      try {
        const question = await Question.findById(questionId);
        if (question) {
          question.likes += 1;
          await question.save();

          // Broadcast to all viewers
          io.to(question.session.toString()).emit('question:liked', {
            id: question._id,
            likes: question.likes
          });
        }
      } catch (error) {
        console.error('Error liking question:', error);
      }
    });

    // Highlight product
    socket.on('product:highlight', ({ sessionId, productId }) => {
      // Broadcast to all viewers
      io.to(sessionId).emit('product:highlighted', { productId });
      console.log(`Product ${productId} highlighted in session ${sessionId}`);
    });

    // End session
    socket.on('session:end', async ({ sessionId }) => {
      try {
        const session = await Session.findById(sessionId);
        if (session) {
          session.status = 'ended';
          session.endTime = new Date();
          await session.save();

          // Notify all viewers
          io.to(sessionId).emit('session:ended');

          // Clear active session
          activeSessions.delete(sessionId);

          console.log(`Session ${sessionId} ended`);
        }
      } catch (error) {
        console.error('Error ending session:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.sessionId && activeSessions.has(socket.sessionId)) {
        activeSessions.get(socket.sessionId).delete(socket.id);
        const viewerCount = activeSessions.get(socket.sessionId).size;

        // Broadcast viewer update
        io.to(socket.sessionId).emit('viewers:update', {
          count: viewerCount
        });

        console.log(`User disconnected. Session ${socket.sessionId} viewers: ${viewerCount}`);
      }
      console.log('User disconnected:', socket.id);
    });
  });
};