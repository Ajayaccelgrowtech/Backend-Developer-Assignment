const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants/roles');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `User role '${req.user.role}' is not authorized to perform this action. Required: [${roles.join(', ')}]`
        )
      );
    }

    next();
  };
};

/**
 * Returns a filter query object scoped by user role for Lead, Customer, Deal, Activity queries.
 * Admin: returns {} (unrestricted access)
 * Sales Manager: returns {} or manager team filter if applicable
 * Sales Executive: returns { assignedTo: req.user._id }
 */
const buildRoleScopedFilter = (user, existingFilter = {}) => {
  if (user.role === ROLES.ADMIN) {
    return existingFilter;
  }

  if (user.role === ROLES.SALES_EXECUTIVE) {
    return {
      ...existingFilter,
      assignedTo: user._id
    };
  }

  if (user.role === ROLES.SALES_MANAGER) {
    // Sales Managers can see all team leads/deals/customers or own
    return existingFilter;
  }

  return existingFilter;
};

module.exports = {
  authorize,
  buildRoleScopedFilter
};
