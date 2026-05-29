import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WardenReportPage.css';

function WardenWeeklyReportPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeeklyReport();
  }, []);

  const fetchWeeklyReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/warden/weekly-report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReportData(data.stats || []);
      }
    } catch (err) {
      setError('Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="report-page">
      <nav className="navbar">
        <div className="nav-brand">🏫 Hostel Management</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="report-container">
        <div className="header-section">
          <h1>📈 Weekly Report</h1>
          <p>Last 7 Days Attendance Summary</p>
          <button onClick={() => navigate('/warden/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        {reportData.length > 0 ? (
          <div className="weekly-table">
            <table>
              <thead>
                <tr>
                  <th>📅 Date</th>
                  <th>🌅 Morning</th>
                  <th>🌞 Afternoon</th>
                  <th>🌙 Night</th>
                  <th>📊 Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((day, idx) => (
                  <tr key={idx}>
                    <td className="date">{formatDate(day._id)}</td>
                    <td className="present">{day.morningPresent}</td>
                    <td className="present">{day.afternoonPresent}</td>
                    <td className="present">{day.nightPresent}</td>
                    <td className="total">
                      {day.morningPresent + day.afternoonPresent + day.nightPresent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>📭 No attendance records for the past 7 days</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WardenWeeklyReportPage;