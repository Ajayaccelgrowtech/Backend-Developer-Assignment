const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { logTimelineEvent } = require('../services/timeline.service');
const { ROLES } = require('../constants/roles');

const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, originalLeadId, assignedTo, status } = req.body;

  const lead = await Lead.findById(originalLeadId);
  if (!lead) {
    throw ApiError.notFound('Original lead not found');
  }

  const existingCustomer = await Customer.findOne({ originalLeadId });
  if (existingCustomer) {
    throw ApiError.conflict('A customer record already exists for this lead');
  }

  const assignedUserId = assignedTo || lead.assignedTo || req.user._id;

  const customer = await Customer.create({
    name,
    email,
    phone,
    company,
    address,
    originalLeadId,
    assignedTo: assignedUserId,
    status
  });

  await logTimelineEvent({
    action: 'Customer Created',
    entityType: 'Customer',
    entityId: customer._id,
    performedBy: req.user._id,
    newValue: { name, email, company },
    description: `Customer created directly by ${req.user.name}`
  });

  const populatedCustomer = await Customer.findById(customer._id)
    .populate('assignedTo', 'name email role')
    .populate('originalLeadId', 'name email status');

  return ApiResponse.created(res, 'Customer created successfully', populatedCustomer);
});

const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationParams(req.query);
  const { search, status, assignedTo, startDate, endDate } = req.query;

  const filter = {};

  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    filter.assignedTo = req.user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [customers, totalRecords] = await Promise.all([
    Customer.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('originalLeadId', 'name email status')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Customer.countDocuments(filter)
  ]);

  const pagination = formatPaginatedResponse(totalRecords, page, limit);
  return ApiResponse.success(res, 'Customers retrieved successfully', customers, 200, pagination);
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('originalLeadId');

  if (!customer) {
    throw ApiError.notFound('Customer not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    customer.assignedTo._id.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You do not have permission to view this customer');
  }

  return ApiResponse.success(res, 'Customer retrieved successfully', customer);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw ApiError.notFound('Customer not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    customer.assignedTo.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You can only update customers assigned to you');
  }

  const previousState = { name: customer.name, email: customer.email, phone: customer.phone, status: customer.status };

  Object.assign(customer, req.body);
  await customer.save();

  await logTimelineEvent({
    action: 'Customer Updated',
    entityType: 'Customer',
    entityId: customer._id,
    performedBy: req.user._id,
    previousValue: previousState,
    newValue: { name: customer.name, email: customer.email, status: customer.status },
    description: `Customer details updated by ${req.user.name}`
  });

  const updatedCustomer = await Customer.findById(customer._id)
    .populate('assignedTo', 'name email role')
    .populate('originalLeadId');

  return ApiResponse.success(res, 'Customer updated successfully', updatedCustomer);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw ApiError.notFound('Customer not found');
  }

  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    throw ApiError.forbidden('Sales Executives are not permitted to delete customers');
  }

  await customer.deleteOne();
  return ApiResponse.success(res, 'Customer deleted successfully');
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
