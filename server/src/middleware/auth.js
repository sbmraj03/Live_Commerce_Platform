const jwt = require('jsonwebtoken');
const { User } = require('../models');
const asyncHandler = require('./asyncHandler');
const CustomError = require('../utils/CustomError');

// Protect routes - verify JWT from Authorization header
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new CustomError('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new CustomError('User not found', 401);
    }

    if (!req.user.isActive) {
      throw new CustomError('Your account has been deactivated', 401);
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new CustomError('Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new CustomError('Token expired', 401);
    }
    throw error;
  }
});

// Restrict access to roles like 'admin'
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError('You do not have permission to perform this action', 403);
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};