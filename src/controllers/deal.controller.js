const Deal = require('../models/Deal');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { logTimelineEvent } = require('../services/timeline.service');
const { ROLES } = require('../constants/roles');
const { DEAL_STAGES, CLOSED_STAGES } = require('../constants/dealEnums');

const createDeal = asyncHandler(async (req, res) => {
  const { name, leadId, customerId, assignedTo, value, probability = 50, expectedClosingDate, stage = DEAL_STAGES.QUALIFICATION, description } = req.body;

  const [lead, customer] = await Promise.all([
    Lead.findById(leadId),
    Customer.findById(customerId)
  ]);

  if (!lead) throw ApiError.notFound('Referenced lead not found');
  if (!customer) throw ApiError.notFound('Referenced customer not found');

  const assignedUserId = assignedTo || lead.assignedTo || req.user._id;

  const deal = await Deal.create({
    name,
    leadId,
    customerId,
    assignedTo: assignedUserId,
    value,
    probability,
    expectedClosingDate: new Date(expectedClosingDate),
    stage,
    description
  });

  await logTimelineEvent({
    action: 'Deal Created',
    entityType: 'Deal',
    entityId: deal._id,
    performedBy: req.user._id,
    newValue: { name, value, stage, expectedRevenue: deal.expectedRevenue },
    description: `Deal '${deal.name}' created with value $${value} by ${req.user.name}`
  });

  const populatedDeal = await Deal.findById(deal._id)
    .populate('assignedTo', 'name email role')
    .populate('leadId', 'name email')
    .populate('customerId', 'name company');

  return ApiResponse.created(res, 'Deal created successfully', populatedDeal);
});

const getDeals = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationParams(req.query);
  const { stage, assignedTo, minAmount, maxAmount, search, startDate, endDate } = req.query;

  const filter = {};

  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    filter.assignedTo = req.user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (stage) filter.stage = stage;

  if (minAmount || maxAmount) {
    filter.value = {};
    if (minAmount) filter.value.$gte = parseFloat(minAmount);
    if (maxAmount) filter.value.$lte = parseFloat(maxAmount);
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  if (startDate || endDate) {
    filter.expectedClosingDate = {};
    if (startDate) filter.expectedClosingDate.$gte = new Date(startDate);
    if (endDate) filter.expectedClosingDate.$lte = new Date(endDate);
  }

  const [deals, totalRecords] = await Promise.all([
    Deal.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('leadId', 'name email')
      .populate('customerId', 'name company')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Deal.countDocuments(filter)
  ]);

  const pagination = formatPaginatedResponse(totalRecords, page, limit);
  return ApiResponse.success(res, 'Deals retrieved successfully', deals, 200, pagination);
});

const getDealById = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('leadId')
    .populate('customerId');

  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    deal.assignedTo._id.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You do not have permission to view this deal');
  }

  return ApiResponse.success(res, 'Deal retrieved successfully', deal);
});

const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    deal.assignedTo.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You can only update deals assigned to you');
  }

  const { stage, lossReason, value, probability } = req.body;

  // Business Rule: Closed deal transition check
  if (CLOSED_STAGES.includes(deal.stage) && stage && !CLOSED_STAGES.includes(stage)) {
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.SALES_MANAGER) {
      throw ApiError.forbidden(
        `Closed deal in stage '${deal.stage}' cannot be moved back to active stage '${stage}' without Admin/Manager approval`
      );
    }
  }

  // Business Rule: Lost deal requires lossReason
  if (stage === DEAL_STAGES.LOST) {
    const finalLossReason = lossReason || req.body.lossReason || deal.lossReason;
    if (!finalLossReason || finalLossReason.trim() === '') {
      throw ApiError.badRequest('A deal marked as Lost must include a valid loss reason');
    }
    deal.lossReason = finalLossReason;
  }

  // Business Rule: Won deal probability auto-set to 100
  if (stage === DEAL_STAGES.WON) {
    deal.probability = 100;
  } else if (probability !== undefined) {
    deal.probability = probability;
  }

  const previousStage = deal.stage;
  const previousValue = deal.value;

  Object.assign(deal, req.body);
  await deal.save();

  // Log specific events if stage changed or won/lost
  let action = 'Deal Updated';
  if (stage && stage !== previousStage) {
    if (stage === DEAL_STAGES.WON) action = 'Deal Won';
    else if (stage === DEAL_STAGES.LOST) action = 'Deal Lost';
    else action = 'Deal Stage Changed';
  }

  await logTimelineEvent({
    action,
    entityType: 'Deal',
    entityId: deal._id,
    performedBy: req.user._id,
    previousValue: { stage: previousStage, value: previousValue },
    newValue: { stage: deal.stage, value: deal.value, expectedRevenue: deal.expectedRevenue },
    description: `Deal '${deal.name}' updated by ${req.user.name}. Stage: ${deal.stage}`
  });

  const updatedDeal = await Deal.findById(deal._id)
    .populate('assignedTo', 'name email role')
    .populate('leadId', 'name email')
    .populate('customerId', 'name company');

  return ApiResponse.success(res, 'Deal updated successfully', updatedDeal);
});

const updateDealStage = asyncHandler(async (req, res) => {
  const { stage, lossReason } = req.body;
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    deal.assignedTo.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You can only update deals assigned to you');
  }

  // Business Rule validation
  if (CLOSED_STAGES.includes(deal.stage) && !CLOSED_STAGES.includes(stage)) {
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.SALES_MANAGER) {
      throw ApiError.forbidden(
        `Closed deal in stage '${deal.stage}' cannot be reopened without Admin/Manager permission`
      );
    }
  }

  if (stage === DEAL_STAGES.LOST) {
    if (!lossReason || lossReason.trim() === '') {
      throw ApiError.badRequest('Reason for losing the deal is required when marking stage as Lost');
    }
    deal.lossReason = lossReason;
  }

  if (stage === DEAL_STAGES.WON) {
    deal.probability = 100;
  }

  const previousStage = deal.stage;
  deal.stage = stage;
  await deal.save();

  let action = 'Deal Stage Changed';
  if (stage === DEAL_STAGES.WON) action = 'Deal Won';
  if (stage === DEAL_STAGES.LOST) action = 'Deal Lost';

  await logTimelineEvent({
    action,
    entityType: 'Deal',
    entityId: deal._id,
    performedBy: req.user._id,
    previousValue: { stage: previousStage },
    newValue: { stage },
    description: `Stage changed from '${previousStage}' to '${stage}' by ${req.user.name}`
  });

  return ApiResponse.success(res, 'Deal stage updated successfully', deal);
});

const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }

  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    throw ApiError.forbidden('Sales Executives are not permitted to delete deals');
  }

  await deal.deleteOne();
  return ApiResponse.success(res, 'Deal deleted successfully');
});

module.exports = {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  updateDealStage,
  deleteDeal
};
