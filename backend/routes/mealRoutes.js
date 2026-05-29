const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { protect, verifyActive } = require('../middleware/auth');

router.use(protect, verifyActive);

router.post('/check-in', mealController.checkInForMeal);
router.post('/select', mealController.selectMeal);
router.get('/today-status', mealController.getTodayStatus);

module.exports = router;