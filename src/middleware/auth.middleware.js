const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized to access this route, token missing');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User belonging to this token no longer exists');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('User account has been deactivated');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Invalid or expired token');
    }
    throw err;
  }
});

module.exports = { protect };
