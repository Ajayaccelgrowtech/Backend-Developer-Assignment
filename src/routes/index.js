const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const leadRoutes = require('./lead.routes');
const customerRoutes = require('./customer.routes');
const dealRoutes = require('./deal.routes');
const activityRoutes = require('./activity.routes');
const timelineRoutes = require('./timeline.routes');
const analyticsRoutes = require('./analytics.routes');

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CRM Sales Management System API v1 Root',
    modules: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      leads: '/api/v1/leads',
      customers: '/api/v1/customers',
      deals: '/api/v1/deals',
      activities: '/api/v1/activities',
      timeline: '/api/v1/timeline',
      analytics: '/api/v1/analytics'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/customers', customerRoutes);
router.use('/deals', dealRoutes);
router.use('/activities', activityRoutes);
router.use('/timeline', timelineRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
