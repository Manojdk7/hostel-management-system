import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

function StudentProfilePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    hostelName: user?.hostelName || '',
    roomNumber: user?.roomNumber || '',
    studentId: user?.studentId || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('✅ Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <nav className="navbar">
        <div className="nav-brand">🏫 Hostel Management</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="profile-container">
        <div className="header-section">
          <h1>👤 My Profile</h1>
          <p>Update your information</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        {message && <div className="success-message">{message}</div>}

        <div className="profile-card">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-group">
                <label>👤 Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>📱 Phone Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  readOnly
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>📧 Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>🎓 Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  readOnly
                  className="input-readonly"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Hostel Information</h3>
              
              <div className="form-group">
                <label>🏫 Hostel Name</label>
                <input
                  type="text"
                  name="hostelName"
                  value={formData.hostelName}
                  onChange={handleChange}
                  readOnly
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>🚪 Room Number</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  readOnly
                  className="input-readonly"
                />
              </div>
            </div>

            <div className="info-box">
              <p>ℹ️ Contact the warden to update your profile information</p>
            </div>

            <button type="submit" className="btn-update">
              💾 Profile Information (Read-Only)
            </button>
          </form>
        </div>

        <div className="account-section">
          <h3>⚙️ Account Settings</h3>
          <div className="settings-list">
            <div className="setting-item">
              <span>🔐 Change Password</span>
              <button className="btn-setting">Update</button>
            </div>
            <div className="setting-item">
              <span>🔔 Notifications</span>
              <button className="btn-setting">Manage</button>
            </div>
            <div className="setting-item">
              <span>🚪 Logout</span>
              <button onClick={handleLogout} className="btn-logout-setting">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;