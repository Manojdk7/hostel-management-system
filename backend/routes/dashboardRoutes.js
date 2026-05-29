const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/today-summary', dashboardController.getTodaySummary);
router.get('/attendance-list', dashboardController.getAttendanceList);
router.get('/meal-list', dashboardController.getMealList);
router.get('/statistics', dashboardController.getStatistics);
router.get('/not-checked-in', dashboardController.getNotCheckedIn);

module.exports = router;