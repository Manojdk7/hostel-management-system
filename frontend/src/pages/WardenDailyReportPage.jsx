import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WardenReportPage.css';

function WardenDailyReportPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDailyReport();
  }, []);

  const fetchDailyReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/warden/today-dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReportData(data);
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
          <h1>📊 Daily Report</h1>
          <p>Today's Attendance Summary - {new Date().toLocaleDateString()}</p>
          <button onClick={() => navigate('/warden/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        {reportData && (
          <>
            <div className="stats-grid">
              <div className="stat-card morning">
                <h3>🌅 Morning (6-8 AM)</h3>
                <div className="stat-numbers">
                  <div className="stat-item present">
                    <span className="label">Present</span>
                    <span className="number">{reportData.morning?.present || 0}</span>
                  </div>
                  <div className="stat-item absent">
                    <span className="label">Absent</span>
                    <span className="number">{reportData.morning?.absent || 0}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card afternoon">
                <h3>🌞 Afternoon (12-2 PM)</h3>
                <div className="stat-numbers">
                  <div className="stat-item present">
                    <span className="label">Present</span>
                    <span className="number">{reportData.afternoon?.present || 0}</span>
                  </div>
                  <div className="stat-item absent">
                    <span className="label">Absent</span>
                    <span className="number">{reportData.afternoon?.absent || 0}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card night">
                <h3>🌙 Night (6-8 PM)</h3>
                <div className="stat-numbers">
                  <div className="stat-item present">
                    <span className="label">Present</span>
                    <span className="number">{reportData.night?.present || 0}</span>
                  </div>
                  <div className="stat-item absent">
                    <span className="label">Absent</span>
                    <span className="number">{reportData.night?.absent || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="meals-section">
              <h3>🍽️ Kitchen Preparation</h3>
              <div className="meal-cards">
                <div className="meal-card">
                  <div className="meal-emoji">🥐</div>
                  <div className="meal-info">
                    <h4>Breakfast</h4>
                    <p className="meal-count">{reportData.kitchenPreparation?.breakfast || 0} servings</p>
                  </div>
                </div>

                <div className="meal-card">
                  <div className="meal-emoji">🍲</div>
                  <div className="meal-info">
                    <h4>Lunch</h4>
                    <p className="meal-count">{reportData.kitchenPreparation?.lunch || 0} servings</p>
                  </div>
                </div>

                <div className="meal-card">
                  <div className="meal-emoji">🍴</div>
                  <div className="meal-info">
                    <h4>Dinner</h4>
                    <p className="meal-count">{reportData.kitchenPreparation?.dinner || 0} servings</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h3>📈 Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Total Students</span>
                  <span className="value">{reportData.totalStudents || 0}</span>
                </div>
                <div className="summary-item">
                  <span>Total Check-ins</span>
                  <span className="value">
                    {(reportData.morning?.present || 0) + (reportData.afternoon?.present || 0) + (reportData.night?.present || 0)}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Total Meals to Prepare</span>
                  <span className="value">
                    {(reportData.kitchenPreparation?.breakfast || 0) + (reportData.kitchenPreparation?.lunch || 0) + (reportData.kitchenPreparation?.dinner || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="present-students-section" style={{ marginTop: '2.5rem' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>📝 Checked-In Students</h3>
              {reportData.presentStudents && reportData.presentStudents.length > 0 ? (
                <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', padding: '1rem', marginTop: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #edf2f7', color: '#4a5568', fontSize: '0.9rem', fontWeight: '700' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Student ID</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Room</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Breakfast</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Lunch</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Dinner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.presentStudents.map((student, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #edf2f7', color: '#2d3748', fontSize: '0.9rem' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{student.studentId}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{student.name}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{student.roomNumber}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {student.morning === 'present' ? '✅ Checked In' : student.morning === 'out_of_city' ? '📍 Out of City' : '❌ Absent'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {student.afternoon === 'present' ? '✅ Checked In' : student.afternoon === 'out_of_city' ? '📍 Out of City' : '❌ Absent'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {student.night === 'present' ? '✅ Checked In' : student.night === 'out_of_city' ? '📍 Out of City' : '❌ Absent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: '8px', padding: '2rem', textAlign: 'center', color: '#718096', marginTop: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  No students have checked in today.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WardenDailyReportPage;