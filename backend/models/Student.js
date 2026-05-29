const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  hostelName: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  hostelLatitude: {
    type: Number,
    default: 28.5244
  },
  hostelLongitude: {
    type: Number,
    default: 77.1855
  },
  allowedRadius: {
    type: Number,
    default: 2000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.isInsideGeofence = function(latitude, longitude) {
  const R = 6371000;
  const φ1 = (this.hostelLatitude * Math.PI) / 180;
  const φ2 = (latitude * Math.PI) / 180;
  const Δφ = ((latitude - this.hostelLatitude) * Math.PI) / 180;
  const Δλ = ((longitude - this.hostelLongitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= this.allowedRadius;
};

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);