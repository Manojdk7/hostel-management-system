import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelectionPage.css';

function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-page">
      <div className="role-container">
        <h1>🏫 Hostel Management System</h1>
        <p className="subtitle">Select your role to continue</p>

        <div className="role-options">
          <div className="role-card student-card" onClick={() => navigate('/student/login')}>
            <div className="role-icon">👨‍🎓</div>
            <h2>Student</h2>
            <p>Login to check attendance and select meals</p>
            <button className="btn-select">Login as Student</button>
          </div>

          <div className="role-card warden-card" onClick={() => navigate('/warden/login')}>
            <div className="role-icon">👨‍💼</div>
            <h2>Warden</h2>
            <p>Manage attendance and monitor dashboard</p>
            <button className="btn-select">Login as Warden</button>
          </div>
        </div>

        <div className="info-section">
          <p>🔒 Secure login with phone number and password</p>
          <p>📱 Students can register with their phone number</p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelectionPage;