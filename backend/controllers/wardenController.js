const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.getTodayDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const hostelName = req.warden?.hostelName || req.user?.hostelName;

    // Filter active students by the warden's hostel
    const query = { isActive: true };
    if (hostelName) {
      query.hostelName = hostelName;
    }
    const totalStudents = await Student.countDocuments(query);

    const attendance = await Attendance.find({ date: today })
      .populate('studentId', 'name studentId hostelName roomNumber');

    // Filter attendance records by warden's hostel and filter out orphaned/deleted student records
    const hostelAttendance = attendance.filter(
      a => a.studentId && (!hostelName || a.studentId.hostelName === hostelName)
    );

    // Morning stats
    const morningPresent = hostelAttendance.filter(a => a.morningCheckIn.status === 'present').length;
    const morningAbsent = totalStudents - morningPresent;

    // Afternoon stats
    const afternoonPresent = hostelAttendance.filter(a => a.afternoonCheckIn.status === 'present').length;
    const afternoonAbsent = totalStudents - afternoonPresent;

    // Night stats
    const nightPresent = hostelAttendance.filter(a => a.nightCheckIn.status === 'present').length;
    const nightAbsent = totalStudents - nightPresent;

    // Meal counts
    const breakfastCount = hostelAttendance.filter(a => a.meals.breakfast.selected).length;
    const lunchCount = hostelAttendance.filter(a => a.meals.lunch.selected).length;
    const dinnerCount = hostelAttendance.filter(a => a.meals.dinner.selected).length;
    const presentToday = hostelAttendance.filter(
      (a) =>
        a.morningCheckIn.status === 'present' ||
        a.afternoonCheckIn.status === 'present' ||
        a.nightCheckIn.status === 'present'
    ).length;
    const absentToday = Math.max(totalStudents - presentToday, 0);

    const presentStudents = hostelAttendance.map(a => ({
      name: a.studentId.name,
      studentId: a.studentId.studentId,
      roomNumber: a.studentId.roomNumber,
      morning: a.morningCheckIn.status,
      afternoon: a.afternoonCheckIn.status,
      night: a.nightCheckIn.status,
      meals: {
        breakfast: a.meals.breakfast.selected,
        lunch: a.meals.lunch.selected,
        dinner: a.meals.dinner.selected
      }
    }));

    return res.status(200).json({
      success: true,
      date: today,
      totalStudents,
      presentToday,
      absentToday,
      presentStudents,
      
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
        presentStudents,
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

    const hostelName = req.warden?.hostelName || req.user?.hostelName;
    const records = await Attendance.find(query)
      .populate('studentId', 'name studentId email mobile hostelName roomNumber')
      .sort({ createdAt: -1 });

    const filteredRecords = records.filter(
      r => r.studentId && (!hostelName || r.studentId.hostelName === hostelName)
    );

    return res.status(200).json({
      success: true,
      mealType,
      count: filteredRecords.length,
      students: filteredRecords
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
    const hostelName = req.warden?.hostelName || req.user?.hostelName;
    const query = { isActive: true };
    if (hostelName) {
      query.hostelName = hostelName;
    }
    const allStudents = await Student.find(query);
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
