const { User } = require('../models');
const { asyncHandler } = require('../middleware');
const CustomError = require('../utils/CustomError');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password) {
    throw new CustomError('Please provide name, email and password', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError('User with this email already exists', 400);
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'viewer' // Default to viewer if not specified
  });

  // Generate token
  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new CustomError('Please provide email and password', 400);
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new CustomError('Your account has been deactivated', 401);
  }

  // Verify password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Generate token
  const token = user.generateAuthToken();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new CustomError('Email already in use', 400);
    }
  }

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new CustomError('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new CustomError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  // Verify current password
  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    throw new CustomError('Current password is incorrect', 401);
  }

  // Update password (will be hashed by pre-save hook)
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};