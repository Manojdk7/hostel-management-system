const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, verifyActive } = require('../middleware/auth');

router.use(protect, verifyActive);
router.post('/check-in', attendanceController.checkIn);
router.post('/meals', attendanceController.selectMeals);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/history', attendanceController.getAttendanceHistory);
router.post('/auto-mark-absent', attendanceController.autoMarkAbsent);

module.exports = router;