const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { createActivitySchema, updateActivitySchema } = require('../validators/activity.validator');

router.use(protect);

router.post('/', validate(createActivitySchema), activityController.createActivity);
router.get('/', activityController.getActivities);
router.get('/:id', activityController.getActivityById);
router.put('/:id', validate(updateActivitySchema), activityController.updateActivity);
router.patch('/:id/complete', activityController.completeActivity);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;
