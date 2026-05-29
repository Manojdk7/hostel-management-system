const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.getTodayDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalStudents = await Student.countDocuments({ isActive: true });

    const attendance = await Attendance.find({ date: today })
      .populate('studentId', 'name studentId hostelName roomNumber');

    // Morning stats
    const morningPresent = attendance.filter(a => a.morningCheckIn.status === 'present').length;
    const morningAbsent = totalStudents - morningPresent;

    // Afternoon stats
    const afternoonPresent = attendance.filter(a => a.afternoonCheckIn.status === 'present').length;
    const afternoonAbsent = totalStudents - afternoonPresent;

    // Night stats
    const nightPresent = attendance.filter(a => a.nightCheckIn.status === 'present').length;
    const nightAbsent = totalStudents - nightPresent;

    // Meal counts
    const breakfastCount = attendance.filter(a => a.meals.breakfast.selected).length;
    const lunchCount = attendance.filter(a => a.meals.lunch.selected).length;
    const dinnerCount = attendance.filter(a => a.meals.dinner.selected).length;
    const presentToday = attendance.filter(
      (a) =>
        a.morningCheckIn.status === 'present' ||
        a.afternoonCheckIn.status === 'present' ||
        a.nightCheckIn.status === 'present'
    ).length;
    const absentToday = Math.max(totalStudents - presentToday, 0);

    return res.status(200).json({
      success: true,
      date: today,
      totalStudents,
      presentToday,
      absentToday,
      
      morning: {
        present: morningPresent,
        absent: morningAbsent
      },
      
      afternoon: {
        present: afternoonPresent,
        absent: afternoonAbsent
      },
      
      night: {
        present: nightPresent,
        absent: nightAbsent
      },
      
      kitchenPreparation: {
        breakfast: breakfastCount,
        lunch: lunchCount,
        dinner: dinnerCount
      },

      stats: {
        totalStudents,
        presentToday,
        absentToday,
        morningAttendance: {
          present: morningPresent,
          absent: morningAbsent
        },
        afternoonAttendance: {
          present: afternoonPresent,
          absent: afternoonAbsent
        },
        nightAttendance: {
          present: nightPresent,
          absent: nightAbsent
        },
        mealStats: {
          breakfast: breakfastCount,
          lunch: lunchCount,
          dinner: dinnerCount
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.getDetailedReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { mealType } = req.query;

    const query = { date: today };
    
    if (mealType === 'breakfast') {
      query['morningCheckIn.status'] = 'present';
    } else if (mealType === 'lunch') {
      query['afternoonCheckIn.status'] = 'present';
    } else if (mealType === 'dinner') {
      query['nightCheckIn.status'] = 'present';
    }

    const records = await Attendance.find(query)
      .populate('studentId', 'name studentId email mobile hostelName roomNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      mealType,
      count: records.length,
      students: records
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};

exports.getWeeklyReport = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const stats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate.toISOString().split('T')[0], $lte: endDate.toISOString().split('T')[0] }
        }
      },
      {
        $group: {
          _id: '$date',
          morningPresent: {
            $sum: { $cond: [{ $eq: ['$morningCheckIn.status', 'present'] }, 1, 0] }
          },
          afternoonPresent: {
            $sum: { $cond: [{ $eq: ['$afternoonCheckIn.status', 'present'] }, 1, 0] }
          },
          nightPresent: {
            $sum: { $cond: [{ $eq: ['$nightCheckIn.status', 'present'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      period: 'weekly',
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
    const checkedIn = await Attendance.find({ date: today });

    let notCheckedIn = [];
    const checkedInIds = checkedIn.map(r => r.studentId.toString());

    for (const student of allStudents) {
      if (!checkedInIds.includes(student._id.toString())) {
        notCheckedIn.push({
          id: student._id,
          name: student.name,
          studentId: student.studentId,
          mobile: student.mobile,
          hostel: student.hostelName,
          room: student.roomNumber
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: notCheckedIn.length,
      students: notCheckedIn
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
};
