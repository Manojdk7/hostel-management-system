const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, verifyActive } = require('../middleware/auth');

router.use(protect, verifyActive);
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markNotificationRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
