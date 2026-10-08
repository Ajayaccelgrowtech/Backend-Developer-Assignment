const Timeline = require('../models/Timeline');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const getEntityTimeline = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const { page, limit, skip, sort } = getPaginationParams(req.query);

  const filter = {
    entityType,
    entityId
  };

  const [events, totalRecords] = await Promise.all([
    Timeline.find(filter)
      .populate('performedBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Timeline.countDocuments(filter)
  ]);

  const pagination = formatPaginatedResponse(totalRecords, page, limit);

  return ApiResponse.success(res, `Timeline events for ${entityType} retrieved successfully`, events, 200, pagination);
});

module.exports = {
  getEntityTimeline
};
