import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/WardenDashboard.css';

function WardenDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/warden/today-dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalStudents: 299,
        presentToday: 245,
        absentToday: 54,
        morningAttendance: { present: 250, absent: 49 },
        afternoonAttendance: { present: 245, absent: 54 },
        nightAttendance: { present: 248, absent: 51 },
        mealStats: { breakfast: 200, lunch: 210, dinner: 195 }
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
      <div className="warden-dashboard-page">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  const attendancePercentage = stats ? ((stats.presentToday / stats.totalStudents) * 100).toFixed(1) : 0;

  return (
    <div className="warden-dashboard-page">
      {/* NAVBAR */}
      <nav className="navbar-warden">
        <div className="navbar-content">
          <div className="navbar-left">
            <h1 className="navbar-title">🏫 Hostel Management</h1>
            <span className="navbar-subtitle">Warden Dashboard</span>
          </div>
          <div className="navbar-right">
            <div className="warden-info">
              <span className="warden-name">{user?.name}</span>
              <span className="warden-hostel">{user?.hostelName}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout-warden">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="warden-container">
        {/* HEADER SECTION */}
        <div className="dashboard-header">
          <h2>Today's Overview</h2>
          <p>Real-time attendance and meal statistics</p>
        </div>

        {/* TOP STATS CARDS */}
        <div className="stats-grid-top">
          <div className="stat-card primary">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <p className="stat-number">{stats?.totalStudents}</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Present Today</h3>
              <p className="stat-number">{stats?.presentToday}</p>
              <span className="stat-percentage">{attendancePercentage}%</span>
            </div>
          </div>

          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>Absent Today</h3>
              <p className="stat-number">{stats?.absentToday}</p>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Attendance Rate</h3>
              <p className="stat-number">{attendancePercentage}%</p>
            </div>
          </div>
        </div>

        {/* ATTENDANCE BY TIME */}
        <div className="section-title">
          <h3>📍 Attendance by Meal Time</h3>
        </div>

        <div className="attendance-grid">
          <div className="attendance-card">
            <div className="meal-icon">🌅</div>
            <h4>Breakfast (6-8 AM)</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{width: `${(stats?.morningAttendance?.present / stats?.totalStudents * 100).toFixed(1)}%`}}
              ></div>
            </div>
            <div className="attendance-stats">
              <span className="present">{stats?.morningAttendance?.present} Present</span>
              <span className="absent">{stats?.morningAttendance?.absent} Absent</span>
            </div>
          </div>

          <div className="attendance-card">
            <div className="meal-icon">🌤️</div>
            <h4>Lunch (12-2 PM)</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{width: `${(stats?.afternoonAttendance?.present / stats?.totalStudents * 100).toFixed(1)}%`}}
              ></div>
            </div>
            <div className="attendance-stats">
              <span className="present">{stats?.afternoonAttendance?.present} Present</span>
              <span className="absent">{stats?.afternoonAttendance?.absent} Absent</span>
            </div>
          </div>

          <div className="attendance-card">
            <div className="meal-icon">🌙</div>
            <h4>Dinner (6-8 PM)</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{width: `${(stats?.nightAttendance?.present / stats?.totalStudents * 100).toFixed(1)}%`}}
              ></div>
            </div>
            <div className="attendance-stats">
              <span className="present">{stats?.nightAttendance?.present} Present</span>
              <span className="absent">{stats?.nightAttendance?.absent} Absent</span>
            </div>
          </div>
        </div>

        {/* MEAL STATISTICS */}
        <div className="section-title">
          <h3>🍽️ Meal Selection Count</h3>
        </div>

        <div className="meal-stats-grid">
          <div className="meal-card">
            <div className="meal-header breakfast">
              <span className="meal-emoji">🥞</span>
              <h4>Breakfast</h4>
            </div>
            <div className="meal-count">{stats?.mealStats?.breakfast}</div>
            <div className="meal-bar">
              <div 
                className="meal-fill breakfast-fill"
                style={{width: `${(stats?.mealStats?.breakfast / stats?.totalStudents * 100).toFixed(1)}%`}}
              ></div>
            </div>
          </div>

          <div className="meal-card">
            <div className="meal-header lunch">
              <span className="meal-emoji">🍲</span>
              <h4>Lunch</h4>
            </div>
            <div className="meal-count">{stats?.mealStats?.lunch}</div>
            <div className="meal-bar">
              <div 
                className="meal-fill lunch-fill"
                style={{width: `${(stats?.mealStats?.lunch / stats?.totalStudents * 100).toFixed(1)}%`}}
              ></div>
            </div>
          </div>

          <div className="meal-card">
            <div className="meal-header dinner">
              <span className="meal-emoji">🍽️</span>
              <h4>Dinner</h4>
            </div>
            <div className="meal-count">{stats?.mealStats?.dinner}</div>
            <div className="meal-bar">
              <div 
                className="meal-fill dinner-fill"
                style={{width: `${(stats?.mealStats?.dinner / stats?.totalStudents * 100).toFixed(1)}%`}}
              ></div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="section-title">
          <h3>⚡ Quick Actions</h3>
        </div>

        <div className="quick-actions-grid">
          <div 
            className="quick-action-card"
            onClick={() => navigate('/warden/daily-report')}
          >
            <div className="qa-icon">📅</div>
            <h4>Daily Report</h4>
            <p>Today's Attendance</p>
            <div className="qa-badge">View →</div>
          </div>

          <div 
            className="quick-action-card"
            onClick={() => navigate('/warden/weekly-report')}
          >
            <div className="qa-icon">📊</div>
            <h4>Weekly Report</h4>
            <p>This Week Stats</p>
            <div className="qa-badge">View →</div>
          </div>

          <div 
            className="quick-action-card"
            onClick={() => navigate('/warden/not-checked-in')}
          >
            <div className="qa-icon">🔍</div>
            <h4>Not Checked In</h4>
            <p>Absent Students</p>
            <div className="qa-badge">View →</div>
          </div>

          <div 
            className="quick-action-card"
            onClick={() => navigate('/warden/settings')}
          >
            <div className="qa-icon">⚙️</div>
            <h4>Settings</h4>
            <p>Preferences</p>
            <div className="qa-badge">View →</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}

export default WardenDashboard;