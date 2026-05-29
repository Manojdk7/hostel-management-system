import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPages.css';

function StudentLoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!mobile || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await onLogin(mobile, password);
    
    if (result.success) {
      navigate('/student/dashboard', { replace: true });
    } else {
      setError(result.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>👨‍🎓 Student Login</h1>
          <p>Enter your credentials to login</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>📱 Phone Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your phone number"
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>🔐 Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <a href="/student/register">Register here</a></p>
            <p><a href="/">Back to Home</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLoginPage;