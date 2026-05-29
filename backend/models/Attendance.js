const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: String,
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  
  // Morning Check-in
  morningCheckIn: {
    status: {
      type: String,
      enum: ['present', 'absent', 'out_of_city'],
      default: 'absent'
    },
    time: { type: Date, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    isInsideGeofence: { type: Boolean, default: false }
  },
  
  // Afternoon Check-in
  afternoonCheckIn: {
    status: {
      type: String,
      enum: ['present', 'absent', 'out_of_city'],
      default: 'absent'
    },
    time: { type: Date, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    isInsideGeofence: { type: Boolean, default: false }
  },
  
  // Night Check-in
  nightCheckIn: {
    status: {
      type: String,
      enum: ['present', 'absent', 'out_of_city'],
      default: 'absent'
    },
    time: { type: Date, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    isInsideGeofence: { type: Boolean, default: false }
  },
  
  // Meal Selection
  meals: {
    breakfast: {
      selected: { type: Boolean, default: false },
      time: { type: Date, default: null }
    },
    lunch: {
      selected: { type: Boolean, default: false },
      time: { type: Date, default: null }
    },
    dinner: {
      selected: { type: Boolean, default: false },
      time: { type: Date, default: null }
    }
  },
  
  overallStatus: {
    type: String,
    enum: ['fully_present', 'partially_present', 'absent'],
    default: 'absent'
  },
  
  notes: {
    type: String,
    default: ''
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, date: -1 });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);