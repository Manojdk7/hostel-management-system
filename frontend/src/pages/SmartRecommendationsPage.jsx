import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SmartRecommendationsPage.css';

function SmartRecommendationsPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [user?.studentId]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/smart-recommendations`,
        { studentId: user?.studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations({
        bestCheckInTime: 'Breakfast (6:30 AM)',
        mealPreferences: ['Breakfast', 'Lunch'],
        suggestedActions: [
          'Maintain consistent check-ins',
          'Select meals immediately after check-in',
          'Monitor your attendance weekly'
        ],
        alerts: ['Great attendance pattern!', 'Keep up the consistency!']
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
      <div className="recommendations-page">
        <div className="loading">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <nav className="navbar">
        <div className="nav-brand">🏫 Hostel Management</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="recommendations-container">
        <div className="page-header">
          <h1>💡 Smart Recommendations</h1>
          <p>Personalized AI suggestions to optimize your attendance</p>
          <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        </div>

        {/* BEST CHECK-IN TIME */}
        <div className="recommendation-section">
          <div className="section-card best-time-card">
            <div className="card-header">
              <span className="card-icon">⏰</span>
              <h2>Best Check-in Time</h2>
            </div>
            <div className="card-body">
              <p className="main-text">{recommendations?.bestCheckInTime}</p>
              <div className="explanation">
                <p>Based on your attendance patterns, this is your strongest time slot. You have the highest consistency during this period.</p>
              </div>
            </div>
          </div>
        </div>

        {/* MEAL PREFERENCES */}
        <div className="recommendation-section">
          <div className="section-card meal-pref-card">
            <div className="card-header">
              <span className="card-icon">🍽️</span>
              <h2>Your Meal Preferences</h2>
            </div>
            <div className="card-body">
              <div className="preferences-list">
                {recommendations?.mealPreferences && recommendations.mealPreferences.length > 0 ? (
                  recommendations.mealPreferences.map((meal, idx) => (
                    <div key={idx} className="preference-item">
                      <span className="pref-icon">✓</span>
                      <span className="pref-name">{meal}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-prefs">Build your meal history by selecting meals consistently</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SUGGESTED ACTIONS */}
        <div className="recommendation-section">
          <h3 className="section-title">🎯 Suggested Actions</h3>
          <div className="actions-cards">
            {recommendations?.suggestedActions?.map((action, idx) => (
              <div key={idx} className="action-card">
                <div className="action-number">{idx + 1}</div>
                <div className="action-content">
                  <p>{action}</p>
                </div>
                <span className="action-arrow">→</span>
              </div>
            ))}
          </div>
        </div>

        {/* ALERTS */}
        <div className="recommendation-section">
          <h3 className="section-title">🔔 Performance Alerts</h3>
          <div className="alerts-grid">
            {recommendations?.alerts?.map((alert, idx) => (
              <div key={idx} className="alert-card">
                <p>{alert}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TIPS */}
        <div className="tips-section">
          <div className="tips-card">
            <h3>💪 Tips to Improve Further</h3>
            <ul className="tips-list">
              <li>Check in during peak hours for better meal placement</li>
              <li>Set reminders 5 minutes before check-in windows</li>
              <li>Select meals immediately after check-in</li>
              <li>Maintain consistency for rewards/recognition</li>
              <li>Share feedback with wardens for improvements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartRecommendationsPage;