const { Session, Product, Reaction, Question } = require('../models');

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Public
// List sessions; supports filtering by status
const getAllSessions = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('products')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single session by ID
// @route   GET /api/sessions/:id
// @access  Public
// Fetch one session with populated products
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('products');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    next(error);
  }
};

// @desc    Get current live session
// @route   GET /api/sessions/live/current
// @access  Public
// Return the most recent live session (if any)
const getLiveSession = async (req, res, next) => {
  try {
    const liveSession = await Session.findOne({ status: 'live' })
      .populate('products')
      .sort({ startTime: -1 });

    if (!liveSession) {
      return res.status(404).json({
        success: false,
        error: 'No live session currently active'
      });
    }

    res.status(200).json({
      success: true,
      data: liveSession
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private (Admin)
// Create a new scheduled session
const createSession = async (req, res, next) => {
  try {
    const { title, description, products, hostName, startTime } = req.body;

    // Validation
    if (!title || !hostName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title and host name'
      });
    }

    // Verify products exist if provided
    if (products && products.length > 0) {
      const existingProducts = await Product.find({ _id: { $in: products } });
      if (existingProducts.length !== products.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more products not found'
        });
      }
    }

    const session = await Session.create({
      title,
      description,
      products: products || [],
      hostName,
      startTime: startTime || Date.now(),
      status: 'scheduled'
    });

    const populatedSession = await Session.findById(session._id)
      .populate('products');

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: populatedSession
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    next(error);
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private (Admin)
// Update fields of a non-live session
const updateSession = async (req, res, next) => {
  try {
    const { title, description, products, hostName, startTime } = req.body;

    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Don't allow updating live or ended sessions
    if (session.status === 'live') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update a live session'
      });
    }

    // Verify products exist if provided
    if (products && products.length > 0) {
      const existingProducts = await Product.find({ _id: { $in: products } });
      if (existingProducts.length !== products.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more products not found'
        });
      }
    }

    // Update fields
    if (title) session.title = title;
    if (description !== undefined) session.description = description;
    if (products) session.products = products;
    if (hostName) session.hostName = hostName;
    if (startTime) session.startTime = startTime;

    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('products');

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: populatedSession
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    next(error);
  }
};

// @desc    Start session (change status to live)
// @route   PUT /api/sessions/:id/start
// @access  Private (Admin)
// Start session (change status to live)
// Mark session as live and notify clients via socket
const startSession = async (req, res, next) => {
    try {
      const session = await Session.findById(req.params.id);
  
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
  
      if (session.status === 'live') {
        return res.status(400).json({
          success: false,
          error: 'Session is already live'
        });
      }
  
      if (session.status === 'ended') {
        return res.status(400).json({
          success: false,
          error: 'Cannot start an ended session'
        });
      }
  
      // Check if there's already a live session
      const existingLiveSession = await Session.findOne({ status: 'live' });
      if (existingLiveSession) {
        return res.status(400).json({
          success: false,
          error: 'Another session is already live. End it before starting a new one.'
        });
      }
  
      session.status = 'live';
      session.startTime = Date.now();
      await session.save();
  
      const populatedSession = await Session.findById(session._id)
        .populate('products');
  
      // Emit socket event to all connected clients
      const { io } = require('../server');
      io.emit('session:started', {
        sessionId: populatedSession._id,
        title: populatedSession.title,
        status: 'live'
      });
  
      res.status(200).json({
        success: true,
        message: 'Session started successfully',
        data: populatedSession
      });
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
      next(error);
    }
  };

// @desc    End session
// @route   PUT /api/sessions/:id/end
// @access  Private (Admin)
// End session
// Mark session as ended and notify its room
const endSession = async (req, res, next) => {
    try {
      const session = await Session.findById(req.params.id);
  
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
  
      if (session.status === 'ended') {
        return res.status(400).json({
          success: false,
          error: 'Session is already ended'
        });
      }
  
      if (session.status === 'scheduled') {
        return res.status(400).json({
          success: false,
          error: 'Cannot end a session that hasn\'t started'
        });
      }
  
      session.status = 'ended';
      session.endTime = Date.now();
      await session.save();
  
      const populatedSession = await Session.findById(session._id)
        .populate('products');
  
      // Emit socket event to session room
      const { io } = require('../server');
      io.to(session._id.toString()).emit('session:ended', {
        sessionId: populatedSession._id,
        title: populatedSession.title,
        status: 'ended'
      });
  
      res.status(200).json({
        success: true,
        message: 'Session ended successfully',
        data: populatedSession
      });
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
      next(error);
    }
  };

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private (Admin)
// Permanently delete a non-live session
const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Don't allow deleting live sessions
    if (session.status === 'live') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a live session. End it first.'
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    next(error);
  }
};

// @desc    Get questions for a session
// @route   GET /api/sessions/:id/questions
// @access  Public
// Paginate/retrieve questions for a session (newest first)
const getSessionQuestions = async (req, res) => {
  try {
    const items = await Question.find({ sessionId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items.map(q => ({
        id: q._id,
        userName: q.userName,
        question: q.question,
        likes: q.likes,
        isAnswered: q.isAnswered,
        answer: q.answer,
        timestamp: q.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
};

// @desc    Get recent reactions for a session
// @route   GET /api/sessions/:id/reactions
// @access  Public
// Get recent reactions for a session
const getSessionReactions = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const items = await Reaction.find({ sessionId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: items.map(r => ({
        id: r._id,
        type: r.type,
        userName: r.userName,
        timestamp: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reactions' });
  }
};

// @desc    Add product to session
// @route   PUT /api/sessions/:id/products/:productId
// @access  Private (Admin)
// Attach a product to a session's product list
const addProductToSession = async (req, res, next) => {
  try {
    const { id, productId } = req.params;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if product already in session
    if (session.products.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Product already in session'
      });
    }

    session.products.push(productId);
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('products');

    res.status(200).json({
      success: true,
      message: 'Product added to session',
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from session
// @route   DELETE /api/sessions/:id/products/:productId
// @access  Private (Admin)
// Remove a product from a session; clears highlight if needed
const removeProductFromSession = async (req, res, next) => {
  try {
    const { id, productId } = req.params;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    session.products = session.products.filter(
      p => p.toString() !== productId
    );
    if (session.highlightedProduct && session.highlightedProduct.toString() === productId) {
      session.highlightedProduct = null;
    }
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('products');

    res.status(200).json({
      success: true,
      message: 'Product removed from session',
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  getLiveSession,
  createSession,
  updateSession,
  startSession,
  endSession,
  deleteSession,
  addProductToSession,
  removeProductFromSession,
  getSessionQuestions,
  getSessionReactions
};