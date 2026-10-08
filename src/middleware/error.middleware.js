const ApiError = require('../utils/apiError');
const env = require('../config/environment');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for '${field}' field. It must be unique.`;
    error = ApiError.conflict(message);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier format for '${err.path}'`;
    error = ApiError.badRequest(message);
  }

  const response = {
    success: false,
    message: error.message
  };

  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  if (env.env === 'development' && error.stack) {
    response.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
