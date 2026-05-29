const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, verifyActive } = require('../middleware/auth');

// Chatbot endpoint
router.post('/chat', protect, aiController.chatWithAI);

// Attendance prediction
router.post('/predict-attendance', protect, verifyActive, aiController.predictAttendance);

// Meal demand prediction
router.get('/predict-meals', protect, aiController.predictMealDemand);

// Anomalies detection
router.post('/detect-anomalies', protect, aiController.detectAnomalies);

// Generate insights
router.post('/generate-insights', protect, aiController.generateInsights);

// Meal waste prediction (NEW)
router.post('/meal-waste-prediction', protect, aiController.predictMealWaste);

// Smart recommendations (NEW)
router.post('/smart-recommendations', protect, aiController.getSmartRecommendations);

// Wellness status (NEW)
router.post('/wellness-status', protect, aiController.getWellnessStatus);

module.exports = router;