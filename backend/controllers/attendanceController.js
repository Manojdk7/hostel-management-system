const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const updateOverallStatus = (attendance) => {
  const statuses = [
    attendance.morningCheckIn?.status,
    attendance.afternoonCheckIn?.status,
    attendance.nightCheckIn?.status
  ];

  if (statuses.every((status) => status === 'present')) {
    attendance.overallStatus = 'fully_present';
  } else if (statuses.some((status) => status === 'present')) {
    attendance.overallStatus = 'partially_present';
  } else {
    attendance.overallStatus = 'absent';
  }
};

const DEADLINE_HOUR = 8;
const DEADLINE_MINUTE = 0;

const isDeadlinePassed = () => {
  const now = new Date();
  const deadline = new Date();
  deadline.setHours(DEADLINE_HOUR, DEADLINE_MINUTE, 0, 0);
  return now > deadline;
};

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const studentId = req.student._id;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (isDeadlinePassed()) {
      return res.status(400).json({ success: false, message: 'Attendance deadline passed', deadlinePassed: true });
    }

    const isInsideGeofence = student.isInsideGeofence(latitude, longitude);
    const today = getTodayDateString();

    let attendance = await Attendance.findOne({ studentId, date: today });

    if (!attendance) {
      attendance = new Attendance({
        studentId,
        date: today,
        morningCheckIn: {
          status: isInsideGeofence ? 'present' : 'out_of_city',
          time: new Date(),
          latitude,
          longitude,
          isInsideGeofence
        }
      });
    } else {
      attendance.morningCheckIn = {
        status: isInsideGeofence ? 'present' : 'out_of_city',
        time: new Date(),
        latitude,
        longitude,
        isInsideGeofence
      };
    }

    updateOverallStatus(attendance);

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: isInsideGeofence ? 'Check-in successful. Present.' : 'Check-in recorded. Outside city.',
      attendance
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Check-in error', error: err.message });
  }
};

exports.selectMeals = async (req, res) => {
  try {
    const { breakfast, lunch, dinner } = req.body;
    const studentId = req.student._id;

    if (breakfast === undefined || lunch === undefined || dinner === undefined) {
      return res.status(400).json({ success: false, message: 'All meals must be selected' });
    }

    const today = getTodayDateString();
    let attendance = await Attendance.findOne({ studentId, date: today });

    if (!attendance) {
      attendance = new Attendance({
        studentId,
        date: today,
        overallStatus: 'absent'
      });
    }

    attendance.meals = {
      breakfast: { selected: Boolean(breakfast), time: breakfast ? new Date() : null },
      lunch: { selected: Boolean(lunch), time: lunch ? new Date() : null },
      dinner: { selected: Boolean(dinner), time: dinner ? new Date() : null }
    };

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: 'Meal selection saved',
      attendance
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Meal selection error', error: err.message });
  }
};

exports.getTodayAttendance = async (req, res) => {
  try {
    const studentId = req.student._id;
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({ studentId, date: today });

    return res.status(200).json({
      success: true,
      attendance,
      deadlinePassed: isDeadlinePassed()
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.student._id;
    const days = parseInt(req.query.days) || 30;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await Attendance.find({
      studentId,
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      }
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      total: records.length,
      records
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.autoMarkAbsent = async (req, res) => {
  try {
    const today = getTodayDateString();

    if (!isDeadlinePassed()) {
      return res.status(400).json({ success: false, message: 'Deadline has not passed yet' });
    }

    const allStudents = await Student.find({ isActive: true });
    const attendanceRecords = await Attendance.find({ date: today });
    const checkedInStudentIds = attendanceRecords.map(r => r.studentId.toString());

    let absentCount = 0;

    for (const student of allStudents) {
      if (!checkedInStudentIds.includes(student._id.toString())) {
        await Attendance.create({
          studentId: student._id,
          date: today,
          morningCheckIn: { status: 'absent' },
          afternoonCheckIn: { status: 'absent' },
          nightCheckIn: { status: 'absent' },
          overallStatus: 'absent'
        });
        absentCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Auto-marked ${absentCount} students as absent`,
      absentCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Auto-mark error', error: err.message });
  }
};
