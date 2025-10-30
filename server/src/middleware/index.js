// Middleware barrel for easy imports
const errorHandler = require('./errorHandler');
const notFound = require('./notFound');
const asyncHandler = require('./asyncHandler');
const validate = require('./validate');
const { protect, restrictTo } = require('./auth');

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  validate,
  protect,
  restrictTo
};