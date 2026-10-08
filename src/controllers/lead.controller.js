const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { logTimelineEvent } = require('../services/timeline.service');
const { ROLES } = require('../constants/roles');
const { LEAD_STATUSES } = require('../constants/leadEnums');
const { DEAL_STAGES } = require('../constants/dealEnums');

const createLead = asyncHandler(async (req, res) => {
  const { name, email, phone, company, source, status, priority, assignedTo, description } = req.body;

  let assignedUser = null;
  if (assignedTo) {
    assignedUser = await User.findById(assignedTo);
    if (!assignedUser || !assignedUser.isActive) {
      throw ApiError.badRequest('Assigned user is invalid or inactive');
    }
  } else if (req.user.role === ROLES.SALES_EXECUTIVE) {
    assignedUser = req.user;
  }

  const lead = await Lead.create({
    name,
    email,
    phone,
    company,
    source,
    status,
    priority,
    assignedTo: assignedUser ? assignedUser._id : null,
    description
  });

  await logTimelineEvent({
    action: 'Lead Created',
    entityType: 'Lead',
    entityId: lead._id,
    performedBy: req.user._id,
    newValue: { name, email, company, status: lead.status },
    description: `Lead created by ${req.user.name}`
  });

  const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email role');
  return ApiResponse.created(res, 'Lead created successfully', populatedLead);
});

const getLeads = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationParams(req.query);
  const { status, priority, source, assignedTo, search, startDate, endDate } = req.query;

  const filter = {};

  // RBAC scope constraint
  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    filter.assignedTo = req.user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (source) filter.source = source;

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

  const [leads, totalRecords] = await Promise.all([
    Lead.find(filter)
      .populate('assignedTo', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(filter)
  ]);

  const pagination = formatPaginatedResponse(totalRecords, page, limit);
  return ApiResponse.success(res, 'Leads fetched successfully', leads, 200, pagination);
});

const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email role');
  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('You do not have permission to view this lead');
  }

  return ApiResponse.success(res, 'Lead retrieved successfully', lead);
});

const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('You can only update leads assigned to you');
  }

  const previousState = { status: lead.status, priority: lead.priority, assignedTo: lead.assignedTo };

  Object.assign(lead, req.body);
  await lead.save();

  await logTimelineEvent({
    action: 'Lead Updated',
    entityType: 'Lead',
    entityId: lead._id,
    performedBy: req.user._id,
    previousValue: previousState,
    newValue: { status: lead.status, priority: lead.priority, assignedTo: lead.assignedTo },
    description: `Lead details updated by ${req.user.name}`
  });

  const updatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email role');
  return ApiResponse.success(res, 'Lead updated successfully', updatedLead);
});

const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('You do not have permission to update status of this lead');
  }

  const previousStatus = lead.status;
  lead.status = status;
  await lead.save();

  await logTimelineEvent({
    action: 'Lead Status Changed',
    entityType: 'Lead',
    entityId: lead._id,
    performedBy: req.user._id,
    previousValue: { status: previousStatus },
    newValue: { status },
    description: `Status changed from ${previousStatus} to ${status}`
  });

  return ApiResponse.success(res, 'Lead status updated successfully', lead);
});

const assignLead = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  const targetUser = await User.findById(assignedTo);
  if (!targetUser || !targetUser.isActive) {
    throw ApiError.badRequest('Assigned user must be an active user');
  }

  const previousAssignedTo = lead.assignedTo;
  lead.assignedTo = targetUser._id;
  await lead.save();

  await logTimelineEvent({
    action: previousAssignedTo ? 'Lead Reassigned' : 'Lead Assigned',
    entityType: 'Lead',
    entityId: lead._id,
    performedBy: req.user._id,
    previousValue: { assignedTo: previousAssignedTo },
    newValue: { assignedTo: targetUser._id },
    description: `Lead assigned to ${targetUser.name} (${targetUser.role})`
  });

  const updatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email role');
  return ApiResponse.success(res, 'Lead assigned successfully', updatedLead);
});

const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    throw ApiError.forbidden('Sales Executives are not permitted to delete leads');
  }

  await lead.deleteOne();
  return ApiResponse.success(res, 'Lead deleted successfully');
});

const convertLead = asyncHandler(async (req, res) => {
  const { dealName, dealValue, probability = 50, expectedClosingDate, dealStage = DEAL_STAGES.QUALIFICATION } = req.body;

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  if (lead.isConverted || lead.status === LEAD_STATUSES.CONVERTED) {
    throw ApiError.badRequest('Lead has already been converted and cannot be converted again');
  }

  // Permitted roles & ownership
  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('You can only convert leads assigned to you');
  }

  const assignedUserId = lead.assignedTo || req.user._id;

  // Use Mongoose Session for transaction safety if replica set is active, fallback safely if single node
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    session = null; // Single node fallback
  }

  try {
    // 1. Create Customer
    const customer = new Customer({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      originalLeadId: lead._id,
      assignedTo: assignedUserId
    });
    await customer.save(session ? { session } : {});

    // 2. Create Deal
    const deal = new Deal({
      name: dealName,
      leadId: lead._id,
      customerId: customer._id,
      assignedTo: assignedUserId,
      value: dealValue,
      probability,
      expectedClosingDate: new Date(expectedClosingDate),
      stage: dealStage
    });
    await deal.save(session ? { session } : {});

    // 3. Update Lead Status
    lead.status = LEAD_STATUSES.CONVERTED;
    lead.isConverted = true;
    lead.convertedAt = new Date();
    await lead.save(session ? { session } : {});

    // 4. Log Timeline Event
    await logTimelineEvent({
      action: 'Lead Converted',
      entityType: 'Lead',
      entityId: lead._id,
      performedBy: req.user._id,
      newValue: { customerId: customer._id, dealId: deal._id },
      description: `Converted lead to Customer '${customer.name}' and Deal '${deal.name}' ($${deal.value})`,
      session
    });

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return ApiResponse.success(res, 'Lead converted successfully to Customer and Deal', {
      lead,
      customer,
      deal
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
});

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  assignLead,
  deleteLead,
  convertLead
};
