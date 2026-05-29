const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.getTodaySummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.find({ date: today }).populate('studentId', 'name studentId');

    const stats = {
      totalPresent: attendance.filter(
        (a) =>
          a.morningCheckIn.status === 'present' ||
          a.afternoonCheckIn.status === 'present' ||
          a.nightCheckIn.status === 'present'
      ).length,
      totalAbsent: attendance.filter(
        (a) =>
          a.morningCheckIn.status !== 'present' &&
          a.afternoonCheckIn.status !== 'present' &&
          a.nightCheckIn.status !== 'present'
      ).length,
      totalOutOfCity: attendance.filter(
        (a) =>
          a.morningCheckIn.status === 'out_of_city' ||
          a.afternoonCheckIn.status === 'out_of_city' ||
          a.nightCheckIn.status === 'out_of_city'
      ).length,
      breakfastCount: attendance.filter((a) => a.meals.breakfast.selected).length,
      lunchCount: attendance.filter((a) => a.meals.lunch.selected).length,
      dinnerCount: attendance.filter((a) => a.meals.dinner.selected).length,
      totalMeals: attendance.reduce(
        (sum, a) =>
          sum +
          [a.meals.breakfast.selected, a.meals.lunch.selected, a.meals.dinner.selected].filter(Boolean).length,
        0
      )
    };

    const totalStudents = await Student.countDocuments({ isActive: true });

    return res.status(200).json({
      success: true,
      date: today,
      totalStudents,
      stats,
      attendanceRate: totalStudents > 0 ? ((stats.totalPresent / totalStudents) * 100).toFixed(2) : 0
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.getAttendanceList = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { status } = req.query;

    const query = { date: today };
    if (status === 'present') {
      query.$or = [
        { 'morningCheckIn.status': 'present' },
        { 'afternoonCheckIn.status': 'present' },
        { 'nightCheckIn.status': 'present' }
      ];
    } else if (status === 'out_of_city') {
      query.$or = [
        { 'morningCheckIn.status': 'out_of_city' },
        { 'afternoonCheckIn.status': 'out_of_city' },
        { 'nightCheckIn.status': 'out_of_city' }
      ];
    } else if (status === 'absent') {
      query['morningCheckIn.status'] = 'absent';
      query['afternoonCheckIn.status'] = 'absent';
      query['nightCheckIn.status'] = 'absent';
    }

    const records = await Attendance.find(query)
      .populate('studentId', 'name studentId email mobile hostelName roomNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.getMealList = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { meal } = req.query;

    if (!meal || !['breakfast', 'lunch', 'dinner'].includes(meal)) {
      return res.status(400).json({ success: false, message: 'Valid meal required' });
    }

    const query = {
      date: today,
      [`meals.${meal}.selected`]: true
    };

    const records = await Attendance.find(query)
      .populate('studentId', 'name studentId email hostelName roomNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      meal,
      count: records.length,
      students: records
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const endDate = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      return res.status(400).json({ success: false, message: 'Period must be week or month' });
    }

    const stats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate.toISOString().split('T')[0],
            $lte: endDate.toISOString().split('T')[0]
          }
        }
      },
      {
        $group: {
          _id: '$date',
          present: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$morningCheckIn.status', 'present'] },
                    { $eq: ['$afternoonCheckIn.status', 'present'] },
                    { $eq: ['$nightCheckIn.status', 'present'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          absent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$morningCheckIn.status', 'absent'] },
                    { $eq: ['$afternoonCheckIn.status', 'absent'] },
                    { $eq: ['$nightCheckIn.status', 'absent'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          outOfCity: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$morningCheckIn.status', 'out_of_city'] },
                    { $eq: ['$afternoonCheckIn.status', 'out_of_city'] },
                    { $eq: ['$nightCheckIn.status', 'out_of_city'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          breakfast: { $sum: { $cond: ['$meals.breakfast.selected', 1, 0] } },
          lunch: { $sum: { $cond: ['$meals.lunch.selected', 1, 0] } },
          dinner: { $sum: { $cond: ['$meals.dinner.selected', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      period,
      stats
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.getNotCheckedIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allStudents = await Student.find({ isActive: true });
    const checkedInRecords = await Attendance.find({ date: today }).select('studentId');
    const checkedInIds = checkedInRecords.map(r => r.studentId.toString());
    const notCheckedIn = allStudents.filter(s => !checkedInIds.includes(s._id.toString()));

    return res.status(200).json({
      success: true,
      date: today,
      totalStudents: allStudents.length,
      checkedIn: checkedInIds.length,
      notCheckedIn: notCheckedIn.length,
      students: notCheckedIn
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};
