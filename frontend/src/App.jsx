import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Pages
import RoleSelectionPage from './pages/RoleSelectionPage';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import WardenLoginPage from './pages/WardenLoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentCheckInPage from './pages/StudentCheckInPage';
import StudentHistoryPage from './pages/StudentHistoryPage';
import StudentStatusPage from './pages/StudentStatusPage';
import StudentProfilePage from './pages/StudentProfilePage';
import WardenDashboard from './pages/WardenDashboard';
import WardenDailyReportPage from './pages/WardenDailyReportPage';
import WardenWeeklyReportPage from './pages/WardenWeeklyReportPage';
import WardenNotCheckedInPage from './pages/WardenNotCheckedInPage';
import WardenSettingsPage from './pages/WardenSettingsPage';
import ChatbotPage from './pages/ChatbotPage';
import NotificationsPage from './pages/NotificationsPage';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';
import MealWastePredictionPage from './pages/MealWastePredictionPage';
import SmartRecommendationsPage from './pages/SmartRecommendationsPage';
import WellnessStatusPage from './pages/WellnessStatusPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'student' or 'warden'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    const storedUser = localStorage.getItem('user');

    if (token && storedUserType && storedUser) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUser(JSON.parse(storedUser));
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Handle Student Registration
  const handleStudentRegister = async (formData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/student/register`, formData);
      const { token, student } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'student');
      localStorage.setItem('user', JSON.stringify(student));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsAuthenticated(true);
      setUserType('student');
      setUser(student);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // Handle Student Login
  const handleStudentLogin = async (mobile, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/student/login`, {
        mobile,
        password
      });
      
      const { token, student } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'student');
      localStorage.setItem('user', JSON.stringify(student));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsAuthenticated(true);
      setUserType('student');
      setUser(student);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Handle Warden Login
  const handleWardenLogin = async (mobile, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/warden/login`, {
        mobile,
        password
      });
      
      const { token, warden } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'warden');
      localStorage.setItem('user', JSON.stringify(warden));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsAuthenticated(true);
      setUserType('warden');
      setUser(warden);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    
    setIsAuthenticated(false);
    setUserType(null);
    setUser(null);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleSelectionPage />} />
        
        {/* Student Routes */}
        <Route 
          path="/student/login" 
          element={!isAuthenticated ? <StudentLoginPage onLogin={handleStudentLogin} /> : <Navigate to="/student/dashboard" />} 
        />
        <Route 
          path="/student/register" 
          element={!isAuthenticated ? <StudentRegisterPage onRegister={handleStudentRegister} /> : <Navigate to="/student/dashboard" />} 
        />

        {/* Student Protected Routes */}
        {isAuthenticated && userType === 'student' && (
          <>
            <Route path="/student/dashboard" element={<StudentDashboard user={user} onLogout={handleLogout} />} />
            <Route path="/student/checkin" element={<StudentCheckInPage user={user} onLogout={handleLogout} />} />
            <Route path="/student/history" element={<StudentHistoryPage user={user} onLogout={handleLogout} />} />
            <Route path="/student/status" element={<StudentStatusPage user={user} onLogout={handleLogout} />} />
            <Route path="/student/profile" element={<StudentProfilePage user={user} onLogout={handleLogout} />} />
           < Route path="/student/chatbot" element={<ChatbotPage user={user} onLogout={handleLogout} />} />
            <Route path="/student/notifications" element={<NotificationsPage user={user} onLogout={handleLogout} />} />
            <Route path="/student/analytics" element={<PredictiveAnalyticsPage user={user} onLogout={handleLogout} />} />
            <Route path="/student/meal-waste" element={<MealWastePredictionPage user={user} onLogout={handleLogout} />} />

            <Route path="/student/recommendations" element={<SmartRecommendationsPage user={user} onLogout={handleLogout} />} />

            <Route path="/student/wellness" element={<WellnessStatusPage user={user} onLogout={handleLogout} />} />
          </>
        )}

        {/* Warden Routes */}
        <Route 
          path="/warden/login" 
          element={!isAuthenticated ? <WardenLoginPage onLogin={handleWardenLogin} /> : <Navigate to="/warden/dashboard" />} 
        />

        {/* Warden Protected Routes */}
        {isAuthenticated && userType === 'warden' && (
          <>
            <Route path="/warden/dashboard" element={<WardenDashboard user={user} onLogout={handleLogout} />} />
            <Route path="/warden/daily-report" element={<WardenDailyReportPage user={user} onLogout={handleLogout} />} />
            <Route path="/warden/weekly-report" element={<WardenWeeklyReportPage user={user} onLogout={handleLogout} />} />
            <Route path="/warden/not-checked-in" element={<WardenNotCheckedInPage user={user} onLogout={handleLogout} />} />
            <Route path="/warden/settings" element={<WardenSettingsPage user={user} onLogout={handleLogout} />} />
          </>
        )}

        {/* Redirect to home for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;