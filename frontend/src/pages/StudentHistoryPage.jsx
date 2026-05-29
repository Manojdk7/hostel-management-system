import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HistoryPage.css';

function StudentHistoryPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meals/today-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.attendance || []);
      }
    } catch (err) {
      setError('Error fetching history');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    if (status === 'present') return 'status-present';
    if (status === 'out_of_city') return 'status-out';
    return 'status-absent';
  };

  return (
    <div className="history-page">
      <nav className="navbar">
        <div className="nav-brand">🏫 Hostel Management</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="history-container">
        <div className="header-section">
          <h1>📊 Attendance History</h1>
          <p>Your check-in records</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        {!loading && !history && (
          <div className="empty-state">
            <p>📭 No attendance records yet</p>
            <p>Start by checking in!</p>
          </div>
        )}

        {history && (
          <div className="history-card">
            <div className="history-header">
              <h3>Today's Attendance</h3>
              <p className="date">{new Date().toLocaleDateString()}</p>
            </div>

            <div className="checkin-details">
              <div className="detail-item">
                <span className="label">🌅 Morning Check-in</span>
                <span className={`status ${getStatusColor(history.morningCheckIn?.status)}`}>
                  {history.morningCheckIn?.status || 'Not checked in'}
                </span>
              </div>

              <div className="detail-item">
                <span className="label">🌞 Afternoon Check-in</span>
                <span className={`status ${getStatusColor(history.afternoonCheckIn?.status)}`}>
                  {history.afternoonCheckIn?.status || 'Not checked in'}
                </span>
              </div>

              <div className="detail-item">
                <span className="label">🌙 Night Check-in</span>
                <span className={`status ${getStatusColor(history.nightCheckIn?.status)}`}>
                  {history.nightCheckIn?.status || 'Not checked in'}
                </span>
              </div>
            </div>

            <div className="meals-section">
              <h4>🍽️ Meals Selected</h4>
              <div className="meal-items">
                <div className={`meal ${history.meals?.breakfast?.selected ? 'selected' : 'not-selected'}`}>
                  <span>🥐 Breakfast</span>
                  <span className="check">{history.meals?.breakfast?.selected ? '✓' : '✗'}</span>
                </div>
                <div className={`meal ${history.meals?.lunch?.selected ? 'selected' : 'not-selected'}`}>
                  <span>🍲 Lunch</span>
                  <span className="check">{history.meals?.lunch?.selected ? '✓' : '✗'}</span>
                </div>
                <div className={`meal ${history.meals?.dinner?.selected ? 'selected' : 'not-selected'}`}>
                  <span>🍴 Dinner</span>
                  <span className="check">{history.meals?.dinner?.selected ? '✓' : '✗'}</span>
                </div>
              </div>
            </div>

            <div className="summary">
              <p>📈 Total Check-ins: {[history.morningCheckIn?.status, history.afternoonCheckIn?.status, history.nightCheckIn?.status].filter(s => s === 'present').length}/3</p>
              <p>🍽️ Total Meals: {[history.meals?.breakfast?.selected, history.meals?.lunch?.selected, history.meals?.dinner?.selected].filter(m => m).length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentHistoryPage;