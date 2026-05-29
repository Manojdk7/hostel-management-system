const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/warden', require('./routes/wardenRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// TEST ROUTE
console.log('✅ All routes loaded successfully!');
app.get('/api/test-warden', (req, res) => {
  res.json({ success: true, message: 'Warden route file is loaded!' });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[ERROR] ${status}: ${message}`);
  res.status(status).json({
    success: false,
    status,
    message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 Hostel Management System Server Started
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 Server: http://localhost:${PORT}
  📦 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017'}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app;
