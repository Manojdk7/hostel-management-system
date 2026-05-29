import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/WellnessStatusPage.css';

function WellnessStatusPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [wellness, setWellness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWellnessStatus();
  }, [user?.studentId]);

  const fetchWellnessStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/wellness-status`,
        { studentId: user?.studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setWellness(response.data.wellness);
      }
    } catch (error) {
      console.error('Error fetching wellness:', error);
      setWellness({
        healthScore: 80,
        status: 'Good',
        recentAbsences: 2,
        mealBalance: 'Balanced',
        recommendations: ['Maintain current routine', 'Stay consistent'],
        alerts: ['Good health status!']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    if (status === 'Excellent') return '#48bb78';
    if (status === 'Good') return '#4299e1';
    if (status === 'Needs Improvement') return '#f6ad55';
    return '#718096';
  };

  const getScoreCategory = (score) => {
    if (score >= 90) return 'Outstanding';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <div className="wellness-page">
        <div className="loading">Loading wellness status...</div>
      </div>
    );
  }

  return (
    <div className="wellness-page">
      <nav className="navbar">
        <div className="nav-brand">🏫 Hostel Management</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="wellness-container">
        <div className="page-header">
          <h1>💚 Health & Wellness Status</h1>
          <p>Your personalized health and well-being insights</p>
          <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        </div>

        {/* HEALTH SCORE CARD */}
        <div className="health-score-card">
          <div className="score-left">
            <h2>Your Health Score</h2>
            <p className="score-description">Based on attendance and meal patterns</p>
          </div>
          <div className="score-right">
            <div className="circular-score">
              <svg className="progress-ring" width="180" height="180">
                <circle
                  className="progress-ring-background"
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke="#edf2f7"
                  strokeWidth="8"
                />
                <circle
                  className="progress-ring-fill"
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke={getStatusColor(wellness?.status)}
                  strokeWidth="8"
                  strokeDasharray={`${(wellness?.healthScore / 100) * 502.65} 502.65`}
                />
              </svg>
              <div className="score-text">
                <span className="score-number">{wellness?.healthScore}%</span>
                <span className="score-label">{getScoreCategory(wellness?.healthScore)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS BOXES */}
        <div className="status-boxes-grid">
          <div className="status-box overall-status">
            <div className="status-icon">🎯</div>
            <h3>Overall Status</h3>
            <p className="status-value">{wellness?.status}</p>
            <span className="status-badge">{wellness?.status}</span>
          </div>

          <div className="status-box absence-status">
            <div className="status-icon">📅</div>
            <h3>Recent Absences</h3>
            <p className="status-value">{wellness?.recentAbsences}</p>
            <span className="status-badge">Last 30 days</span>
          </div>

          <div className="status-box meal-status">
            <div className="status-icon">🍽️</div>
            <h3>Meal Balance</h3>
            <p className="status-value">{wellness?.mealBalance}</p>
            <span className="status-badge">Nutrition</span>
          </div>

          <div className="status-box consistency">
            <div className="status-icon">📊</div>
            <h3>Consistency</h3>
            <p className="status-value">{wellness?.healthScore > 80 ? 'Excellent' : 'Good'}</p>
            <span className="status-badge">Keep it up!</span>
          </div>
        </div>

        {/* ALERTS */}
        {wellness?.alerts && wellness.alerts.length > 0 && (
          <div className="alerts-section">
            <h3 className="section-title">🔔 Important Alerts</h3>
            <div className="alerts-container">
              {wellness.alerts.map((alert, idx) => (
                <div key={idx} className="alert-item">
                  <span className="alert-icon">⚠️</span>
                  <p>{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS */}
        <div className="recommendations-section">
          <h3 className="section-title">💪 Wellness Recommendations</h3>
          <div className="recommendations-grid">
            {wellness?.recommendations?.map((rec, idx) => (
              <div key={idx} className="recommendation-item">
                <div className="rec-number">{idx + 1}</div>
                <div className="rec-content">
                  <p>{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WELLNESS TIPS */}
        <div className="wellness-tips-section">
          <div className="tips-container">
            <h3>🌟 Daily Wellness Tips</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <span className="tip-emoji">💧</span>
                <h4>Stay Hydrated</h4>
                <p>Drink at least 8 glasses of water daily</p>
              </div>

              <div className="tip-card">
                <span className="tip-emoji">🏃</span>
                <h4>Exercise</h4>
                <p>Get 30 minutes of physical activity</p>
              </div>

              <div className="tip-card">
                <span className="tip-emoji">😴</span>
                <h4>Sleep Well</h4>
                <p>Aim for 7-8 hours of quality sleep</p>
              </div>

              <div className="tip-card">
                <span className="tip-emoji">🧘</span>
                <h4>Manage Stress</h4>
                <p>Practice meditation or yoga daily</p>
              </div>

              <div className="tip-card">
                <span className="tip-emoji">🥗</span>
                <h4>Eat Healthy</h4>
                <p>Select balanced meals regularly</p>
              </div>

              <div className="tip-card">
                <span className="tip-emoji">🌞</span>
                <h4>Get Sunlight</h4>
                <p>Spend 15-20 mins in morning sun</p>
              </div>
            </div>
          </div>
        </div>

        {/* HEALTH SCORE BREAKDOWN */}
        <div className="health-breakdown-section">
          <h3 className="section-title">📊 What Affects Your Score</h3>
          <div className="breakdown-items">
            <div className="breakdown-item">
              <div className="breakdown-label">
                <span className="label-icon">✓</span>
                <span>Attendance Consistency</span>
              </div>
              <div className="breakdown-bar">
                <div className="bar-fill" style={{width: `${wellness?.healthScore}%`}}></div>
              </div>
              <span className="percentage">{wellness?.healthScore}%</span>
            </div>

            <div className="breakdown-item">
              <div className="breakdown-label">
                <span className="label-icon">✓</span>
                <span>Meal Selection</span>
              </div>
              <div className="breakdown-bar">
                <div className="bar-fill" style={{width: `${wellness?.mealBalance === 'Balanced' ? 85 : 60}%`}}></div>
              </div>
              <span className="percentage">{wellness?.mealBalance === 'Balanced' ? 85 : 60}%</span>
            </div>

            <div className="breakdown-item">
              <div className="breakdown-label">
                <span className="label-icon">✓</span>
                <span>Absence Rate</span>
              </div>
              <div className="breakdown-bar">
                <div className="bar-fill" style={{width: `${Math.max(0, 100 - (wellness?.recentAbsences * 5))}%`}}></div>
              </div>
              <span className="percentage">{Math.max(0, 100 - (wellness?.recentAbsences * 5))}%</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/student/checkin')}>
            📍 Check In Now
          </button>
          <button className="btn-secondary" onClick={() => navigate('/student/history')}>
            📋 View History
          </button>
        </div>
      </div>
    </div>
  );
}

export default WellnessStatusPage;