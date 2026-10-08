const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');
const {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  convertLeadSchema
} = require('../validators/lead.validator');

router.use(protect);

router.post('/', validate(createLeadSchema), leadController.createLead);
router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.put('/:id', validate(updateLeadSchema), leadController.updateLead);
router.patch('/:id/status', validate(updateLeadStatusSchema), leadController.updateLeadStatus);
router.patch('/:id/assign', authorize(ROLES.ADMIN, ROLES.SALES_MANAGER), validate(assignLeadSchema), leadController.assignLead);
router.post('/:id/convert', validate(convertLeadSchema), leadController.convertLead);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.SALES_MANAGER), leadController.deleteLead);

module.exports = router;
