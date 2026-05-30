import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPages.css';

function StudentRegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    hostelName: '',
    roomNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.mobile || !formData.email || !formData.password || !formData.hostelName || !formData.roomNumber) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await onRegister(formData);
    
    if (result.success) {
      navigate('/student/dashboard', { replace: true });
    } else {
      setError(result.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>📝 Student Register</h1>
          <p>Create your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>👤 Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>📱 Phone Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>📧 Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>🔐 Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 6 chars)"
              />
            </div>

            <div className="form-group">
              <label>🏫 Hostel Name</label>
              <input
                type="text"
                name="hostelName"
                value={formData.hostelName}
                onChange={handleChange}
                placeholder="E.g. Boys Hostel A"
              />
            </div>

            <div className="form-group">
              <label>🚪 Room Number</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="E.g. A-101"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/student/login">Login here</Link></p>
            <p><Link to="/">Back to Home</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentRegisterPage;