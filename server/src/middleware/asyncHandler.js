// Wrapper to catch async errors and pass to error handler
const asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
  
  module.exports = asyncHandler;