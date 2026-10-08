const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/environment');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  const refreshToken = jwt.sign({ id: userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });

  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password
  });

  const tokens = generateTokens(user._id, user.role);

  return ApiResponse.created(res, 'User registered successfully', {
    user,
    tokens
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact administrator.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = generateTokens(user._id, user.role);

  return ApiResponse.success(res, 'Login successful', {
    user,
    tokens
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid refresh token or inactive user');
    }

    const tokens = generateTokens(user._id, user.role);
    return ApiResponse.success(res, 'Token refreshed successfully', tokens);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return ApiResponse.success(res, 'Current user profile fetched successfully', user);
});

const logout = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 'Logout successful');
});

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  logout
};
