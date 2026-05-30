const Student = require('../models/Student');
const { generateToken } = require('../middleware/auth');

// ============ STUDENT REGISTRATION ============
exports.registerStudent = async (req, res) => {
  try {
    const { name, mobile, email, password, hostelName, roomNumber } = req.body;

    // Validation
    if (!name || !mobile || !email || !password || !hostelName || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile must be 10 digits'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if student already exists
    let student = await Student.findOne({
      $or: [{ mobile }, { email }]
    });

    if (student) {
      return res.status(400).json({
        success: false,
        message: 'Phone number or Email already registered'
      });
    }

    // Create new student
    student = new Student({
      studentId: `STU${Date.now()}`, // Auto-generate student ID
      name,
      mobile,
      email,
      password,
      hostelName,
      roomNumber,
      hostelLatitude: 14.4644,
      hostelLongitude: 75.9217
    });

    await student.save();
    const token = generateToken(student._id, 'student');

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        hostelName: student.hostelName,
        roomNumber: student.roomNumber
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Registration error',
      error: err.message
    });
  }
};

// ============ STUDENT LOGIN ============
exports.loginStudent = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password required'
      });
    }

    const student = await Student.findOne({ mobile }).select('+password');

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    const isPasswordCorrect = await student.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const token = generateToken(student._id, 'student');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      userType: 'student',
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        hostelName: student.hostelName,
        roomNumber: student.roomNumber,
        hostelLatitude: student.hostelLatitude,
        hostelLongitude: student.hostelLongitude,
        allowedRadius: student.allowedRadius
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Login error',
      error: err.message
    });
  }
};

// ============ STUDENT GET PROFILE ============
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    return res.status(200).json({
      success: true,
      student
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error',
      error: err.message
    });
  }
};

// ============ STUDENT LOGOUT ============
exports.logoutStudent = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// ============ WARDEN LOGIN ============
const Warden = require('../models/Warden');

exports.loginWarden = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password required'
      });
    }

    const warden = await Warden.findOne({ mobile }).select('+password');

    if (!warden) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    if (!warden.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    const isPasswordCorrect = await warden.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const token = generateToken(warden._id, 'warden');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      userType: 'warden',
      warden: {
        id: warden._id,
        name: warden.name,
        mobile: warden.mobile,
        email: warden.email,
        hostelName: warden.hostelName,
        designation: warden.designation
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Login error',
      error: err.message
    });
  }
};

// ============ GET WARDEN PROFILE ============
exports.getWardenProfile = async (req, res) => {
  try {
    const warden = await Warden.findById(req.warden?.id || req.user?.id);
    if (!warden) {
      return res.status(404).json({
        success: false,
        message: 'Warden not found'
      });
    }
    return res.status(200).json({
      success: true,
      warden
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error',
      error: err.message
    });
  }
};
