const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/me', isAuthenticated, authController.getProfile);

module.exports = router;
