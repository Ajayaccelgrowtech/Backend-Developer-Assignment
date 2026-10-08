const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { LEAD_STATUSES } = require('../constants/leadEnums');
const { DEAL_STAGES, CLOSED_STAGES } = require('../constants/dealEnums');
const { ACTIVITY_STATUSES } = require('../constants/activityEnums');
const { ROLES } = require('../constants/roles');

const getOverviewMetrics = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    filter.assignedTo = req.user._id;
  }

  const [
    totalLeads,
    newLeads,
    qualifiedLeads,
    convertedLeads,
    totalCustomers,
    totalDeals,
    wonDeals,
    lostDeals,
    pendingActivities,
    overdueActivities,
    dealsAgg
  ] = await Promise.all([
    Lead.countDocuments(filter),
    Lead.countDocuments({ ...filter, status: LEAD_STATUSES.NEW }),
    Lead.countDocuments({ ...filter, status: LEAD_STATUSES.QUALIFIED }),
    Lead.countDocuments({ ...filter, status: LEAD_STATUSES.CONVERTED }),
    Customer.countDocuments(filter),
    Deal.countDocuments(filter),
    Deal.countDocuments({ ...filter, stage: DEAL_STAGES.WON }),
    Deal.countDocuments({ ...filter, stage: DEAL_STAGES.LOST }),
    Activity.countDocuments({ ...filter, status: ACTIVITY_STATUSES.PENDING }),
    Activity.countDocuments({
      ...filter,
      status: ACTIVITY_STATUSES.PENDING,
      dueDate: { $lt: new Date() }
    }),
    Deal.aggregate([
      { $match: filter.assignedTo ? { assignedTo: filter.assignedTo } : {} },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$stage', DEAL_STAGES.WON] }, '$value', 0]
            }
          },
          expectedRevenue: {
            $sum: '$expectedRevenue'
          }
        }
      }
    ])
  ]);

  const openDeals = totalDeals - (wonDeals + lostDeals);
  const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(2)) : 0;
  const totalRevenue = dealsAgg[0] ? dealsAgg[0].totalRevenue : 0;
  const expectedRevenue = dealsAgg[0] ? dealsAgg[0].expectedRevenue : 0;

  return ApiResponse.success(res, 'Overview sales metrics fetched successfully', {
    totalLeads,
    newLeads,
    qualifiedLeads,
    convertedLeads,
    totalCustomers,
    totalDeals,
    openDeals,
    wonDeals,
    lostDeals,
    totalRevenue,
    expectedRevenue,
    conversionRatePercentage: conversionRate,
    pendingActivities,
    overdueActivities
  });
});

const getPipelineMetrics = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === ROLES.SALES_EXECUTIVE) {
    filter.assignedTo = req.user._id;
  }

  const pipelineStages = Object.values(DEAL_STAGES);

  const stageAgg = await Deal.aggregate([
    { $match: filter.assignedTo ? { assignedTo: filter.assignedTo } : {} },
    {
      $group: {
        _id: '$stage',
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        totalExpectedRevenue: { $sum: '$expectedRevenue' }
      }
    }
  ]);

  const resultMap = {};
  stageAgg.forEach((item) => {
    resultMap[item._id] = {
      count: item.count,
      totalValue: item.totalValue,
      totalExpectedRevenue: item.totalExpectedRevenue
    };
  });

  const pipeline = pipelineStages.map((stage) => ({
    stage,
    count: resultMap[stage] ? resultMap[stage].count : 0,
    totalValue: resultMap[stage] ? resultMap[stage].totalValue : 0,
    totalExpectedRevenue: resultMap[stage] ? resultMap[stage].totalExpectedRevenue : 0
  }));

  return ApiResponse.success(res, 'Sales pipeline breakdown retrieved successfully', { pipeline });
});

const getTeamPerformance = asyncHandler(async (req, res) => {
  // Available to Admin and Sales Manager
  const executives = await User.find({ role: ROLES.SALES_EXECUTIVE, isActive: true }).select('name email role');

  const performance = await Promise.all(
    executives.map(async (exec) => {
      const [assignedLeads, convertedLeads, wonDeals, revenueAgg] = await Promise.all([
        Lead.countDocuments({ assignedTo: exec._id }),
        Lead.countDocuments({ assignedTo: exec._id, status: LEAD_STATUSES.CONVERTED }),
        Deal.countDocuments({ assignedTo: exec._id, stage: DEAL_STAGES.WON }),
        Deal.aggregate([
          { $match: { assignedTo: exec._id, stage: DEAL_STAGES.WON } },
          { $group: { _id: null, total: { $sum: '$value' } } }
        ])
      ]);

      const closedRevenue = revenueAgg[0] ? revenueAgg[0].total : 0;
      const conversionRate = assignedLeads > 0 ? Number(((convertedLeads / assignedLeads) * 100).toFixed(2)) : 0;

      return {
        executive: {
          id: exec._id,
          name: exec.name,
          email: exec.email
        },
        assignedLeads,
        convertedLeads,
        wonDeals,
        closedRevenue,
        conversionRatePercentage: conversionRate
      };
    })
  );

  return ApiResponse.success(res, 'Team performance metrics retrieved successfully', { performance });
});

module.exports = {
  getOverviewMetrics,
  getPipelineMetrics,
  getTeamPerformance
};
