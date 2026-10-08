const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');
const { createUserSchema, updateUserSchema, toggleStatusSchema } = require('../validators/user.validator');

// All user management routes require Admin authorization
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.patch('/:id/status', validate(toggleStatusSchema), userController.toggleUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
