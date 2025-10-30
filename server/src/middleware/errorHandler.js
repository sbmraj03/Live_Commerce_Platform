// Normalizes known errors and returns consistent JSON
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;


  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error.statusCode = 404;
    error.message = message;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value`;
    error.statusCode = 400;
    error.message = message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    error.statusCode = 400;
    error.message = message;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again';
    error.statusCode = 401;
    error.message = message;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again';
    error.statusCode = 401;
    error.message = message;
  }

  res.status(error.statusCode || err.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...({ stack: err.stack })
  });
};

module.exports = errorHandler;