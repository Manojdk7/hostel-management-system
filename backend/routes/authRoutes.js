const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, verifyActive } = require('../middleware/auth');

// ========== STUDENT ROUTES ==========
router.post('/student/register', authController.registerStudent);
router.post('/student/login', authController.loginStudent);
router.get('/student/profile', protect, verifyActive, authController.getStudentProfile);
router.post('/student/logout', protect, authController.logoutStudent);

// ========== WARDEN ROUTES ==========
router.post('/warden/login', authController.loginWarden);
router.get('/warden/profile', protect, authController.getWardenProfile);

module.exports = router;