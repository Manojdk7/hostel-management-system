import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WardenReportPage.css';

function WardenSettingsPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true
  });

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleToggle = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
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
          <h1>⚙️ Settings</h1>
          <p>Manage your preferences</p>
          <button onClick={() => navigate('/warden/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        <div className="settings-card">
          <h3>🔔 Notification Settings</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>📧 Email Alerts</h4>
                <p>Get email notifications for attendance reports</p>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={notifications.emailAlerts}
                  onChange={() => handleToggle('emailAlerts')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>💬 SMS Alerts</h4>
                <p>Get SMS notifications for important updates</p>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={notifications.smsAlerts}
                  onChange={() => handleToggle('smsAlerts')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>🔔 Push Notifications</h4>
                <p>Get push notifications on your device</p>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={notifications.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3>👤 Account Information</h3>
          <div className="account-info">
            <div className="info-item">
              <span className="label">Name:</span>
              <span className="value">{user?.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone:</span>
              <span className="value">{user?.mobile}</span>
            </div>
            <div className="info-item">
              <span className="label">Hostel:</span>
              <span className="value">{user?.hostelName}</span>
            </div>
          </div>
        </div>

        <div className="settings-card danger-zone">
          <h3>🔐 Danger Zone</h3>
          <button 
            onClick={handleLogout} 
            className="btn-logout-full"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default WardenSettingsPage;