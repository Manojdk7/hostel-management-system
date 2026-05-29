const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const getMealTimeWindows = () => ({
  breakfast: { start: 6, end: 8, field: 'morningCheckIn' },
  lunch: { start: 12, end: 14, field: 'afternoonCheckIn' },
  dinner: { start: 18, end: 20, field: 'nightCheckIn' }
});

exports.checkInForMeal = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      location,
      mealType
    } = req.body;
    const studentId = req.student._id;
    const resolvedLatitude = latitude ?? location?.latitude;
    const resolvedLongitude = longitude ?? location?.longitude;

    if (resolvedLatitude === undefined || resolvedLongitude === undefined || !mealType) {
      return res.status(400).json({ success: false, message: 'Location and meal type required' });
    }

    const windows = getMealTimeWindows();
    if (!windows[mealType]) {
      return res.status(400).json({ success: false, message: 'Invalid meal type' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const isInsideGeofence = student.isInsideGeofence(resolvedLatitude, resolvedLongitude);

    const today = getTodayDateString();
    let attendance = await Attendance.findOne({ studentId, date: today });

    if (!attendance) {
      attendance = new Attendance({
        studentId,
        date: today
      });
    }

    const checkInField = windows[mealType].field;
    attendance[checkInField] = {
      status: isInsideGeofence ? 'present' : 'out_of_city',
      time: new Date(),
      latitude: resolvedLatitude,
      longitude: resolvedLongitude,
      isInsideGeofence
    };

    if (isInsideGeofence) {
      attendance.meals[mealType].selected = true;
      attendance.meals[mealType].time = new Date();
    }

    attendance.overallStatus = ['morningCheckIn', 'afternoonCheckIn', 'nightCheckIn'].every(
      (field) => attendance[field]?.status === 'present'
    )
      ? 'fully_present'
      : ['morningCheckIn', 'afternoonCheckIn', 'nightCheckIn'].some(
          (field) => attendance[field]?.status === 'present'
        )
        ? 'partially_present'
        : 'absent';

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: isInsideGeofence ? `${mealType} check-in successful` : `${mealType} check-in recorded (outside city)`,
      attendance: {
        id: attendance._id,
        mealType,
        status: attendance[checkInField].status,
        isInsideGeofence,
        mealSelected: attendance.meals[mealType].selected
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.selectMeal = async (req, res) => {
  try {
    const { mealType } = req.body;
    const studentId = req.student._id;

    const windows = getMealTimeWindows();
    if (!windows[mealType]) {
      return res.status(400).json({ success: false, message: 'Invalid meal type' });
    }

    const today = getTodayDateString();
    let attendance = await Attendance.findOne({ studentId, date: today });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No attendance record. Check in first!' });
    }

    const checkInField = windows[mealType].field;
    if (attendance[checkInField].status !== 'present') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot select ${mealType}. You are not marked present for this time.` 
      });
    }

    attendance.meals[mealType].selected = true;
    attendance.meals[mealType].time = new Date();

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: `${mealType} selected`,
      attendance
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const studentId = req.student._id;
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({ studentId, date: today });

    const windows = getMealTimeWindows();

    let availableMeals = [];
    for (const [meal, window] of Object.entries(windows)) {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= window.start && hour < window.end) {
        availableMeals.push(meal);
      }
    }

    return res.status(200).json({
      success: true,
      attendance,
      status: attendance,
      availableMeals,
      mealTimes: windows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};
