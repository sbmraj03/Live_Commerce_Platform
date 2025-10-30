// Routes for managing live sessions lifecycle
const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/sessionController');
const { protect, restrictTo } = require('../middleware');

// Get current live session (must be before /:id) - Public
router.get('/live/current', getLiveSession);

// Public routes
router.get('/', getAllSessions);
router.get('/:id', getSessionById);
router.get('/:id/questions', getSessionQuestions);
router.get('/:id/reactions', getSessionReactions);

// Protected routes (only admins)
router.post('/', protect, restrictTo('admin'), createSession);
router.put('/:id', protect, restrictTo('admin'), updateSession);
router.delete('/:id', protect, restrictTo('admin'), deleteSession);

// Session control routes (only admins)
router.put('/:id/start', protect, restrictTo('admin'), startSession);
router.put('/:id/end', protect, restrictTo('admin'), endSession);

// Product management routes (only admins)
router.put('/:id/products/:productId', protect, restrictTo('admin'), addProductToSession);
router.delete('/:id/products/:productId', protect, restrictTo('admin'), removeProductFromSession);

module.exports = router;