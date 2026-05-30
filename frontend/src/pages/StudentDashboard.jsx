import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

function StudentDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayStatus();
  }, [user?.studentId]);

  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meals/today-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTodayStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching today status:', error);
      setTodayStatus({
        morningCheckIn: { status: 'absent' },
        afternoonCheckIn: { status: 'absent' },
        nightCheckIn: { status: 'absent' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="student-dashboard-page">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="student-dashboard-page">
      {/* NAVBAR */}
      <nav className="navbar-student">
        <div className="navbar-content">
          <div className="navbar-left">
            <h1 className="navbar-title">🏫 Hostel Management</h1>
            <span className="navbar-subtitle">Student Dashboard</span>
          </div>
          <div className="navbar-right">
            <div className="student-info">
              <span className="student-name">{user?.name}</span>
              <span className="student-room">{user?.hostelName} | Room {user?.roomNumber}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout-student">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="student-container">
        {/* HEADER SECTION */}
        <div className="dashboard-header-student">
          <h2>Welcome, {user?.name}! 👋</h2>
          <p>Manage your attendance and meal preferences</p>
        </div>

        {/* TODAY'S STATUS CARDS */}
        <div className="section-title">
          <h3>📍 Today's Check-in Status</h3>
        </div>

        <div className="today-status-grid">
          <div className={`status-card ${todayStatus?.morningCheckIn?.status || 'absent'}`}>
            <div className="status-icon">🌅</div>
            <h4>Breakfast</h4>
            <p className="status-time">6:00 AM - 8:00 AM</p>
            <div className="status-badge">
              {todayStatus?.morningCheckIn?.status === 'present' 
                ? '✅ Present' 
                : todayStatus?.morningCheckIn?.status === 'out_of_city'
                ? '📍 Out of City'
                : '⏳ Not Checked'}
            </div>
          </div>

          <div className={`status-card ${todayStatus?.afternoonCheckIn?.status || 'absent'}`}>
            <div className="status-icon">🌤️</div>
            <h4>Lunch</h4>
            <p className="status-time">12:00 PM - 2:00 PM</p>
            <div className="status-badge">
              {todayStatus?.afternoonCheckIn?.status === 'present' 
                ? '✅ Present' 
                : todayStatus?.afternoonCheckIn?.status === 'out_of_city'
                ? '📍 Out of City'
                : '⏳ Not Checked'}
            </div>
          </div>

          <div className={`status-card ${todayStatus?.nightCheckIn?.status || 'absent'}`}>
            <div className="status-icon">🌙</div>
            <h4>Dinner</h4>
            <p className="status-time">6:00 PM - 8:00 PM</p>
            <div className="status-badge">
              {todayStatus?.nightCheckIn?.status === 'present' 
                ? '✅ Present' 
                : todayStatus?.nightCheckIn?.status === 'out_of_city'
                ? '📍 Out of City'
                : '⏳ Not Checked'}
            </div>
          </div>
        </div>

        {/* QUICK ACCESS FEATURES */}
        <div className="section-title">
          <h3>⚡ Quick Access</h3>
        </div>

        <div className="features-grid">
          <div 
            className="feature-card primary-card"
            onClick={() => navigate('/student/checkin')}
          >
            <div className="feature-icon">📍</div>
            <h4>Daily Check-in</h4>
            <p>Check in and select meals</p>
            <div className="feature-btn">Go →</div>
          </div>

          <div 
            className="feature-card secondary-card"
            onClick={() => navigate('/student/history')}
          >
            <div className="feature-icon">📋</div>
            <h4>Attendance History</h4>
            <p>View your attendance records</p>
            <div className="feature-btn">View →</div>
          </div>

          <div 
            className="feature-card tertiary-card"
            onClick={() => navigate('/student/status')}
          >
            <div className="feature-icon">⏰</div>
            <h4>Check Status</h4>
            <p>See your current status</p>
            <div className="feature-btn">Check →</div>
          </div>

          <div 
            className="feature-card quaternary-card"
            onClick={() => navigate('/student/profile')}
          >
            <div className="feature-icon">👤</div>
            <h4>My Profile</h4>
            <p>Edit your profile</p>
            <div className="feature-btn">Edit →</div>
          </div>
        </div>

        {/* AI FEATURES */}
        <div className="section-title">
          <h3>🤖 AI-Powered Features</h3>
        </div>

        <div className="ai-features-grid">
          <div 
            className="ai-card chatbot-card"
            onClick={() => navigate('/student/chatbot')}
          >
            <div className="ai-icon">🤖</div>
            <h4>AI Assistant</h4>
            <p>Chat for instant help</p>
            <div className="ai-badge">Try Now →</div>
          </div>

          <div 
            className="ai-card notification-card"
            onClick={() => navigate('/student/notifications')}
          >
            <div className="ai-icon">🔔</div>
            <h4>Notifications</h4>
            <p>Smart alerts & reminders</p>
            <div className="ai-badge">View →</div>
          </div>

          <div 
            className="ai-card analytics-card"
            onClick={() => navigate('/student/analytics')}
          >
            <div className="ai-icon">📊</div>
            <h4>AI Analytics</h4>
            <p>Personalized insights</p>
            <div className="ai-badge">Explore →</div>
          </div>

          <div 
            className="ai-card meal-waste-card"
            onClick={() => navigate('/student/meal-waste')}
          >
            <div className="ai-icon">🍽️</div>
            <h4>Meal Waste Prediction</h4>
            <p>Reduce food waste & costs</p>
            <div className="ai-badge">Discover →</div>
          </div>

          <div 
            className="ai-card recommendations-card"
            onClick={() => navigate('/student/recommendations')}
          >
            <div className="ai-icon">💡</div>
            <h4>Smart Recommendations</h4>
            <p>Optimize your attendance</p>
            <div className="ai-badge">Learn →</div>
          </div>

          <div 
            className="ai-card wellness-card"
            onClick={() => navigate('/student/wellness')}
          >
            <div className="ai-icon">💚</div>
            <h4>Wellness Status</h4>
            <p>Health & well-being insights</p>
            <div className="ai-badge">Check →</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="dashboard-footer-student">
        <p>📌 Keep checking in during meal times to maintain good attendance!</p>
      </footer>
    </div>
  );
}

export default StudentDashboard;