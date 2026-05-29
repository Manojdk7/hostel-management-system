import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WardenReportPage.css';

function WardenNotCheckedInPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotCheckedIn();
  }, []);

  const fetchNotCheckedIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/warden/not-checked-in`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
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
          <h1>⚠️ Not Checked In</h1>
          <p>Students who haven't checked in today</p>
          <button onClick={() => navigate('/warden/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        <div className="info-bar">
          <span>Total: {students.length} students</span>
        </div>

        {students.length > 0 ? (
          <div className="students-grid">
            {students.map((student, idx) => (
              <div key={idx} className="student-card">
                <div className="student-header">
                  <h4>👤 {student.name}</h4>
                  <span className="student-id">{student.studentId}</span>
                </div>
                <div className="student-details">
                  <p><span className="label">📱 Phone:</span> {student.mobile}</p>
                  <p><span className="label">🏫 Hostel:</span> {student.hostel}</p>
                  <p><span className="label">🚪 Room:</span> {student.room}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>✅ All students have checked in today!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WardenNotCheckedInPage;