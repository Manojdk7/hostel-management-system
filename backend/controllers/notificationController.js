const Attendance = require('../models/Attendance');

const buildNotifications = (student, attendance) => {
  const notifications = [];
  const now = new Date().toISOString();

  if (!attendance) {
    notifications.push({
      _id: 'attendance-reminder',
      title: 'Check-in pending',
      message: 'No meal check-in has been recorded for today yet.',
      type: 'ALERT',
      severity: 'warning',
      read: false,
      createdAt: now
    });
  } else {
    const pendingMeals = [];

    if (!attendance.morningCheckIn?.time) pendingMeals.push('breakfast');
    if (!attendance.afternoonCheckIn?.time) pendingMeals.push('lunch');
    if (!attendance.nightCheckIn?.time) pendingMeals.push('dinner');

    if (pendingMeals.length > 0) {
      notifications.push({
        _id: 'pending-meals',
        title: 'Remaining check-ins today',
        message: `Pending meal windows: ${pendingMeals.join(', ')}.`,
        type: 'INFO',
        severity: 'info',
        read: false,
        createdAt: now,
        details: {
          hostel: student.hostelName,
          room: student.roomNumber
        }
      });
    }

    const outsideCity = ['morningCheckIn', 'afternoonCheckIn', 'nightCheckIn'].some(
      (field) => attendance[field]?.status === 'out_of_city'
    );

    if (outsideCity) {
      notifications.push({
        _id: 'geofence-warning',
        title: 'Outside geofence detected',
        message: 'One of your check-ins was marked outside the hostel geofence.',
        type: 'WARNING',
        severity: 'warning',
        read: false,
        createdAt: now
      });
    }
  }

  notifications.push({
    _id: 'welcome-info',
    title: 'Hostel Assistant ready',
    message: 'Use the AI assistant, analytics, and wellness pages for personalized guidance.',
    type: 'INFO',
    severity: 'info',
    read: false,
    createdAt: now
  });

  return notifications;
};

exports.getNotifications = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ studentId: req.student._id, date: today });

    return res.status(200).json({
      success: true,
      notifications: buildNotifications(req.student, attendance)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: err.message
    });
  }
};

exports.markNotificationRead = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: `Notification ${req.params.id} marked as read`
  });
};

exports.deleteNotification = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: `Notification ${req.params.id} deleted`
  });
};
