const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const Timeline = require('../models/Timeline');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/environment');
const { ROLES } = require('../constants/roles');
const { LEAD_SOURCES, LEAD_STATUSES, LEAD_PRIORITIES } = require('../constants/leadEnums');
const { DEAL_STAGES } = require('../constants/dealEnums');
const { ACTIVITY_TYPES, ACTIVITY_STATUSES } = require('../constants/activityEnums');

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
    throw ApiError.unauthorized('Invalid email or password. Has the database been seeded? Visit /api/v1/auth/seed to seed demo accounts.');
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

const seedDatabase = asyncHandler(async (req, res) => {
  const adminExists = await User.findOne({ email: 'admin@crm.com' });
  if (adminExists) {
    return ApiResponse.success(res, 'Database has already been seeded with demo accounts', {
      admin: 'admin@crm.com',
      manager: 'manager@crm.com',
      exec1: 'alex.exec@crm.com'
    });
  }

  // Create Users
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@crm.com',
    phone: '+1-555-0100',
    password: 'AdminPassword123!',
    role: ROLES.ADMIN,
    isActive: true
  });

  const manager = await User.create({
    name: 'Sarah Jenkins (Sales Manager)',
    email: 'manager@crm.com',
    phone: '+1-555-0101',
    password: 'ManagerPassword123!',
    role: ROLES.SALES_MANAGER,
    isActive: true
  });

  const exec1 = await User.create({
    name: 'Alex Rivera (Sales Exec)',
    email: 'alex.exec@crm.com',
    phone: '+1-555-0102',
    password: 'ExecPassword123!',
    role: ROLES.SALES_EXECUTIVE,
    isActive: true
  });

  const exec2 = await User.create({
    name: 'Michael Scott (Sales Exec)',
    email: 'michael.exec@crm.com',
    phone: '+1-555-0103',
    password: 'ExecPassword123!',
    role: ROLES.SALES_EXECUTIVE,
    isActive: true
  });

  // Create Leads
  const lead1 = await Lead.create({
    name: 'Acme Corp Lead',
    email: 'contact@acmecorp.com',
    phone: '+1-415-555-2671',
    company: 'Acme Corporation',
    source: LEAD_SOURCES.WEBSITE,
    status: LEAD_STATUSES.QUALIFIED,
    priority: LEAD_PRIORITIES.HIGH,
    assignedTo: exec1._id,
    description: 'Interested in enterprise cloud package'
  });

  const lead2 = await Lead.create({
    name: 'TechStart Innovations',
    email: 'hello@techstart.io',
    phone: '+1-415-555-9012',
    company: 'TechStart',
    source: LEAD_SOURCES.REFERRAL,
    status: LEAD_STATUSES.CONVERTED,
    priority: LEAD_PRIORITIES.MEDIUM,
    assignedTo: exec1._id,
    isConverted: true,
    convertedAt: new Date()
  });

  // Create Customer
  const customer1 = await Customer.create({
    name: 'TechStart Innovations',
    email: 'hello@techstart.io',
    phone: '+1-415-555-9012',
    company: 'TechStart',
    address: '100 Silicon Way, San Francisco, CA',
    originalLeadId: lead2._id,
    assignedTo: exec1._id,
    status: 'Active'
  });

  // Create Deals
  const deal1 = await Deal.create({
    name: 'TechStart Annual SaaS Contract',
    leadId: lead2._id,
    customerId: customer1._id,
    assignedTo: exec1._id,
    value: 45000,
    probability: 80,
    expectedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    stage: DEAL_STAGES.PROPOSAL,
    description: 'Enterprise tier license contract'
  });

  const deal2 = await Deal.create({
    name: 'TechStart Pilot Add-on',
    leadId: lead2._id,
    customerId: customer1._id,
    assignedTo: exec1._id,
    value: 12000,
    probability: 100,
    expectedClosingDate: new Date(),
    stage: DEAL_STAGES.WON,
    description: 'Initial pilot module closed successfully'
  });

  // Create Activity
  await Activity.create({
    type: ACTIVITY_TYPES.CALL,
    title: 'Discovery call with Acme Corp CTO',
    description: 'Discuss technical requirements and timeline',
    assignedTo: exec1._id,
    createdBy: manager._id,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: ACTIVITY_STATUSES.PENDING,
    relatedModel: 'Lead',
    relatedId: lead1._id
  });

  return ApiResponse.success(res, 'Production Cloud Database seeded successfully with demo accounts & records', {
    admin: 'admin@crm.com / AdminPassword123!',
    manager: 'manager@crm.com / ManagerPassword123!',
    exec: 'alex.exec@crm.com / ExecPassword123!'
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
  seedDatabase,
  refreshToken,
  getProfile,
  logout
};
