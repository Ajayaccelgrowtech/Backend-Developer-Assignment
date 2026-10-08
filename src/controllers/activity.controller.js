const Activity = require('../models/Activity');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { logTimelineEvent } = require('../services/timeline.service');
const { ROLES } = require('../constants/roles');
const { ACTIVITY_STATUSES } = require('../constants/activityEnums');

const evaluateActivityStatus = (activity) => {
  const activityObj = activity.toObject ? activity.toObject() : activity;
  if (
    activityObj.status === ACTIVITY_STATUSES.PENDING &&
    new Date(activityObj.dueDate) < new Date()
  ) {
    activityObj.status = ACTIVITY_STATUSES.OVERDUE;
    activityObj.isOverdue = true;
  } else {
    activityObj.isOverdue = activityObj.status === ACTIVITY_STATUSES.OVERDUE;
  }
  return activityObj;
};

const createActivity = asyncHandler(async (req, res) => {
  const { type, title, description, assignedTo, dueDate, status, relatedModel, relatedId } = req.body;

  const assignedUserId = assignedTo || req.user._id;

  const activity = await Activity.create({
    type,
    title,
    description,
    assignedTo: assignedUserId,
    createdBy: req.user._id,
    dueDate: new Date(dueDate),
    status: status || ACTIVITY_STATUSES.PENDING,
    relatedModel,
    relatedId
  });

  await logTimelineEvent({
    action: `Activity Created (${type})`,
    entityType: relatedModel,
    entityId: relatedId,
    performedBy: req.user._id,
    newValue: { title, dueDate, type, activityId: activity._id },
    description: `Activity '${title}' (${type}) created by ${req.user.name}`
  });

  const populatedActivity = await Activity.findById(activity._id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email');

  return ApiResponse.created(res, 'Activity created successfully', evaluateActivityStatus(populatedActivity));
});

const getActivities = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationParams(req.query);
  const { type, status, assignedTo, relatedModel, relatedId, startDate, endDate } = req.query;

  const filter = {};

  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    filter.assignedTo = req.user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (type) filter.type = type;
  if (relatedModel) filter.relatedModel = relatedModel;
  if (relatedId) filter.relatedId = relatedId;

  if (status) {
    if (status === ACTIVITY_STATUSES.OVERDUE) {
      filter.status = ACTIVITY_STATUSES.PENDING;
      filter.dueDate = { $lt: new Date() };
    } else {
      filter.status = status;
    }
  }

  if (startDate || endDate) {
    filter.dueDate = filter.dueDate || {};
    if (startDate) filter.dueDate.$gte = new Date(startDate);
    if (endDate) filter.dueDate.$lte = new Date(endDate);
  }

  const [activities, totalRecords] = await Promise.all([
    Activity.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Activity.countDocuments(filter)
  ]);

  const evaluatedActivities = activities.map(evaluateActivityStatus);
  const pagination = formatPaginatedResponse(totalRecords, page, limit);

  return ApiResponse.success(res, 'Activities retrieved successfully', evaluatedActivities, 200, pagination);
});

const getActivityById = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email');

  if (!activity) {
    throw ApiError.notFound('Activity not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    activity.assignedTo._id.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You do not have permission to view this activity');
  }

  return ApiResponse.success(res, 'Activity retrieved successfully', evaluateActivityStatus(activity));
});

const updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    throw ApiError.notFound('Activity not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    activity.assignedTo.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You can only update activities assigned to you');
  }

  Object.assign(activity, req.body);
  await activity.save();

  const updatedActivity = await Activity.findById(activity._id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email');

  return ApiResponse.success(res, 'Activity updated successfully', evaluateActivityStatus(updatedActivity));
});

const completeActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    throw ApiError.notFound('Activity not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    activity.assignedTo.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You can only complete activities assigned to you');
  }

  activity.status = ACTIVITY_STATUSES.COMPLETED;
  activity.completedAt = new Date();
  await activity.save();

  await logTimelineEvent({
    action: 'Activity Completed',
    entityType: activity.relatedModel,
    entityId: activity.relatedId,
    performedBy: req.user._id,
    newValue: { activityId: activity._id, title: activity.title, completedAt: activity.completedAt },
    description: `Activity '${activity.title}' marked as completed by ${req.user.name}`
  });

  return ApiResponse.success(res, 'Activity marked as completed', evaluateActivityStatus(activity));
});

const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    throw ApiError.notFound('Activity not found');
  }

  if (
    req.user.role === ROLES.SALES_EXECUTIVE &&
    activity.assignedTo.toString() !== req.user._id.toString()
  ) {
    throw ApiError.forbidden('You can only delete activities assigned to you');
  }

  await activity.deleteOne();
  return ApiResponse.success(res, 'Activity deleted successfully');
});

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  completeActivity,
  deleteActivity
};
