// Authentication routes for users (register/login/profile)
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect); // All routes below this will be protected

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

module.exports = router;