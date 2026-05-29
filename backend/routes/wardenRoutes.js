const express = require('express');
const router = express.Router();
const wardenController = require('../controllers/wardenController');
const { protect } = require('../middleware/auth');

// Public endpoint for testing (no auth required)
router.get('/today-dashboard', wardenController.getTodayDashboard);

// Protect all remaining routes
router.use(protect);

router.get('/detailed-report', wardenController.getDetailedReport);
router.get('/weekly-report', wardenController.getWeeklyReport);
router.get('/not-checked-in', wardenController.getNotCheckedIn);

module.exports = router;