const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let studentToken = '';
let wardenToken = '';
let studentId = '';

const testMobile = '9999999999';
const testPassword = 'Password123';

const log = (msg, success = true) => {
  console.log(`${success ? '✅ PASS' : '❌ FAIL'}: ${msg}`);
};

async function runTests() {
  console.log('--- STARTING AUTOMATED API TESTS ---\n');

  try {
    // 1. REGISTER STUDENT
    try {
      const regRes = await axios.post(`${API_URL}/auth/student/register`, {
        name: 'Test Student',
        mobile: testMobile,
        email: 'test@student.com',
        password: testPassword,
        hostelName: 'Boys Hostel A',
        roomNumber: '101'
      });
      studentToken = regRes.data.token;
      log('Student Registration');
    } catch (err) {
      if (err.response?.data?.message?.includes('already registered')) {
        log('Student Registration (Already exists - skipping)', true);
      } else {
        log(`Student Registration: ${err.response?.data?.message || err.message}`, false);
      }
    }

    // 2. LOGIN STUDENT
    try {
      const loginRes = await axios.post(`${API_URL}/auth/student/login`, {
        mobile: testMobile,
        password: testPassword
      });
      studentToken = loginRes.data.token;
      studentId = loginRes.data.student.id;
      log('Student Login');
    } catch (err) {
      log(`Student Login: ${err.response?.data?.message || err.message}`, false);
    }

    const studentAuth = { headers: { Authorization: `Bearer ${studentToken}` } };

    // 3. GET STUDENT PROFILE
    try {
      await axios.get(`${API_URL}/auth/student/profile`, studentAuth);
      log('Get Student Profile');
    } catch (err) {
      log(`Get Student Profile: ${err.response?.data?.message || err.message}`, false);
    }

    // 4. STUDENT CHECK-IN (ATTENDANCE)
    try {
      await axios.post(`${API_URL}/attendance/check-in`, {
        latitude: 28.5244,
        longitude: 77.1855,
        timestamp: new Date().toISOString()
      }, studentAuth);
      log('Student Attendance Check-In');
    } catch (err) {
      if(err.response?.data?.message?.includes('already checked in')) {
         log('Student Attendance Check-In (Already checked in today)', true);
      } else {
         log(`Student Attendance Check-In: ${err.response?.data?.message || err.message}`, false);
      }
    }

    // 5. STUDENT MEAL SELECTION (Expect failure if outside meal window)
    try {
      await axios.post(`${API_URL}/meals/select`, {
        mealType: 'breakfast'
      }, studentAuth);
      log('Student Meal Selection');
    } catch (err) {
      if (err.response?.data?.message?.includes('not marked present')) {
        log('Student Meal Selection (Not present/outside window - expected)', true);
      } else {
        log(`Student Meal Selection: ${err.response?.data?.message || err.message}`, false);
      }
    }

    // 6. WARDEN LOGIN
    try {
      const wardenLogin = await axios.post(`${API_URL}/auth/warden/login`, {
        mobile: '9876543210',
        password: 'warden@123'
      });
      wardenToken = wardenLogin.data.token;
      log('Warden Login');
    } catch (err) {
      log(`Warden Login: ${err.response?.data?.message || err.message}`, false);
    }

    if (wardenToken) {
      const wardenAuth = { headers: { Authorization: `Bearer ${wardenToken}` } };
      
      // 7. WARDEN GET NOT CHECKED IN
      try {
        await axios.get(`${API_URL}/warden/not-checked-in`, wardenAuth);
        log('Warden Get Not Checked In Students');
      } catch (err) {
        log(`Warden Get Not Checked In: ${err.response?.data?.message || err.message}`, false);
      }
    }

    // 8. AI CHATBOT TEST
    try {
      await axios.post(`${API_URL}/ai/chat`, {
        message: 'Hello, how can you help me?'
      }, studentAuth);
      log('AI Chatbot Endpoint');
    } catch (err) {
      log(`AI Chatbot Endpoint: ${err.response?.data?.message || err.message}`, false);
    }

    console.log('\n--- TESTS COMPLETED ---');
  } catch (error) {
    console.error('Test script crashed:', error.message);
  }
}

runTests();
