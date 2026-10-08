const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');
const { createCustomerSchema, updateCustomerSchema } = require('../validators/customer.validator');

router.use(protect);

router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.SALES_MANAGER), customerController.deleteCustomer);

module.exports = router;
