const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validators/auth.validator');

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.get('/seed', authController.seedDatabase);
router.post('/seed', authController.seedDatabase);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.get('/profile', protect, authController.getProfile);
router.post('/logout', protect, authController.logout);

module.exports = router;
