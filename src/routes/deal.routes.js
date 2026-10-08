const express = require('express');
const router = express.Router();
const dealController = require('../controllers/deal.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');
const { createDealSchema, updateDealSchema, updateDealStageSchema } = require('../validators/deal.validator');

router.use(protect);

router.post('/', validate(createDealSchema), dealController.createDeal);
router.get('/', dealController.getDeals);
router.get('/:id', dealController.getDealById);
router.put('/:id', validate(updateDealSchema), dealController.updateDeal);
router.patch('/:id/stage', validate(updateDealStageSchema), dealController.updateDealStage);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.SALES_MANAGER), dealController.deleteDeal);

module.exports = router;
