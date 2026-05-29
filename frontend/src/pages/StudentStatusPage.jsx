import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StatusPage.css';

function StudentStatusPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meals/today-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (err) {
      setError('Error fetching status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const getStatusIcon = (status) => {
    if (status === 'present') return '✅';
    if (status === 'out_of_city') return '📍';
    return '❌';
  };

  const getTimeWindow = (meal) => {
    const times = {
      breakfast: '6:00 AM - 8:00 AM',
      lunch: '12:00 PM - 2:00 PM',
      dinner: '6:00 PM - 8:00 PM'
    };
    return times[meal];
  };

  return (
    <div className="status-page">
      <nav className="navbar">
        <div className="nav-brand">🏫 Hostel Management</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="status-container">
        <div className="header-section">
          <h1>⏰ Current Status</h1>
          <p>Today's Check-in Status</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        {status && (
          <>
            <div className="status-summary">
              <div className="summary-card overall">
                <h3>📊 Overall Status</h3>
                <p className="overall-text">
                  {status.attendance ? 'Attendance Recorded' : 'No Check-in Yet'}
                </p>
              </div>
            </div>

            <div className="meals-grid">
              <div className="meal-window">
                <div className="meal-header">🌅 Breakfast</div>
                <p className="time-window">{getTimeWindow('breakfast')}</p>
                <div className="status-indicator">
                  <span className="icon">
                    {getStatusIcon(status.attendance?.morningCheckIn?.status)}
                  </span>
                  <span className="text">
                    {status.attendance?.morningCheckIn?.status || 'Not Checked In'}
                  </span>
                </div>
                <div className="meal-selection">
                  <p>🥐 Meal: {status.attendance?.meals?.breakfast?.selected ? '✓ Selected' : '✗ Not Selected'}</p>
                </div>
              </div>

              <div className="meal-window">
                <div className="meal-header">🌞 Lunch</div>
                <p className="time-window">{getTimeWindow('lunch')}</p>
                <div className="status-indicator">
                  <span className="icon">
                    {getStatusIcon(status.attendance?.afternoonCheckIn?.status)}
                  </span>
                  <span className="text">
                    {status.attendance?.afternoonCheckIn?.status || 'Not Checked In'}
                  </span>
                </div>
                <div className="meal-selection">
                  <p>🍲 Meal: {status.attendance?.meals?.lunch?.selected ? '✓ Selected' : '✗ Not Selected'}</p>
                </div>
              </div>

              <div className="meal-window">
                <div className="meal-header">🌙 Dinner</div>
                <p className="time-window">{getTimeWindow('dinner')}</p>
                <div className="status-indicator">
                  <span className="icon">
                    {getStatusIcon(status.attendance?.nightCheckIn?.status)}
                  </span>
                  <span className="text">
                    {status.attendance?.nightCheckIn?.status || 'Not Checked In'}
                  </span>
                </div>
                <div className="meal-selection">
                  <p>🍴 Meal: {status.attendance?.meals?.dinner?.selected ? '✓ Selected' : '✗ Not Selected'}</p>
                </div>
              </div>
            </div>

            <div className="action-section">
              <button 
                onClick={() => navigate('/student/checkin')} 
                className="btn-checkin-now"
              >
                ✅ Go to Check-in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentStatusPage;