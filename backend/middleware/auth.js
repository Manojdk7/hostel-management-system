const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Warden = require('../models/Warden');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    let user = null;
    let role = decoded.role;

    if (role === 'warden') {
      user = await Warden.findById(decoded.id);
      if (user) {
        req.warden = user;
      }
    } else if (role === 'student') {
      user = await Student.findById(decoded.id);
      if (user) {
        req.student = user;
      }
    } else {
      user = await Student.findById(decoded.id);
      if (user) {
        role = 'student';
        req.student = user;
      } else {
        user = await Warden.findById(decoded.id);
        if (user) {
          role = 'warden';
          req.warden = user;
        }
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    req.userRole = role;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token is not valid',
      error: err.message
    });
  }
};

exports.verifyActive = (req, res, next) => {
  const currentUser = req.student || req.warden || req.user;
  if (!currentUser?.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated'
    });
  }
  next();
};

exports.generateToken = (id, role = 'student') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};
