const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');

router.use(protect);

router.get('/overview', analyticsController.getOverviewMetrics);
router.get('/pipeline', analyticsController.getPipelineMetrics);
router.get('/team-performance', authorize(ROLES.ADMIN, ROLES.SALES_MANAGER), analyticsController.getTeamPerformance);

module.exports = router;
