const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, isActive } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    isActive
  });

  return ApiResponse.created(res, 'User created successfully', user);
});

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationParams(req.query);
  const { search, role, status } = req.query;

  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (status !== undefined && status !== '') {
    filter.isActive = status === 'active' || status === 'true';
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [users, totalRecords] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  const pagination = formatPaginatedResponse(totalRecords, page, limit);
  return ApiResponse.success(res, 'Users retrieved successfully', users, 200, pagination);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return ApiResponse.success(res, 'User retrieved successfully', user);
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, isActive, password } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('Email already in use by another user');
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password;

  await user.save();
  return ApiResponse.success(res, 'User updated successfully', user);
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.isActive = isActive;
  await user.save();

  return ApiResponse.success(
    res,
    `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    user
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return ApiResponse.success(res, 'User deleted successfully');
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser
};
