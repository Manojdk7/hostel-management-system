import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CheckInPage.css';

function StudentCheckInPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [mealType, setMealType] = useState('breakfast');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('checking');
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const HOSTEL_LATITUDE = user?.hostelLatitude || 28.5244;
  const HOSTEL_LONGITUDE = user?.hostelLongitude || 77.1855;
  const GEOFENCE_RADIUS = user?.allowedRadius || 2000;

  useEffect(() => {
    getStudentLocation();
  }, []);

  // Get student's current GPS location
  const getStudentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setError('GPS not available on this device');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        verifyGeofence(latitude, longitude);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationStatus('denied');
        setError('Please enable location permissions to check in');
      }
    );
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  };

  // Verify if student is within geofence
  const verifyGeofence = (latitude, longitude) => {
    const dist = calculateDistance(
      latitude,
      longitude,
      HOSTEL_LATITUDE,
      HOSTEL_LONGITUDE
    );
    setDistance(dist);

    if (dist <= GEOFENCE_RADIUS) {
      setLocationStatus('verified');
      setError('');
    } else {
      setLocationStatus('outside');
      setError(`You are ${(dist / 1000).toFixed(2)}km away from hostel`);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();

    if (locationStatus !== 'verified') {
      setError('❌ You must be within hostel premises to check in!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meals/check-in`,
        {
          mealType,
          latitude: location.latitude,
          longitude: location.longitude
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('✅ Check-in successful! Meal selected.');
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="checkin-page">
      {/* NAVBAR */}
      <nav className="navbar-checkin">
        <div className="nav-content">
          <h1 className="nav-title">🏫 Daily Check-in</h1>
          <button onClick={handleLogout} className="btn-logout-checkin">
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="checkin-container">
        {/* LOCATION STATUS CARD */}
        <div className={`location-status-card ${locationStatus}`}>
          <div className="location-header">
            <h2>📍 Location Verification</h2>
            <p className="location-city">Davanagere, Karnataka</p>
            <p className="geofence-info">Geofence: 20 km radius</p>
          </div>

          <div className="location-content">
            {locationStatus === 'checking' && (
              <div className="location-checking">
                <div className="spinner"></div>
                <p>Checking your location...</p>
              </div>
            )}

            {locationStatus === 'verified' && (
              <div className="location-verified">
                <div className="status-icon">✅</div>
                <p className="status-text">You are within hostel premises</p>
                <p className="distance-info">
                  Distance: {(distance / 1000).toFixed(2)} km from hostel center
                </p>
                <div className="location-details">
                  <p>Latitude: {location?.latitude.toFixed(4)}</p>
                  <p>Longitude: {location?.longitude.toFixed(4)}</p>
                </div>
              </div>
            )}

            {locationStatus === 'outside' && (
              <div className="location-outside">
                <div className="status-icon">⚠️</div>
                <p className="status-text">You are outside hostel area</p>
                <p className="distance-info">
                  Distance: {(distance / 1000).toFixed(2)} km from hostel
                </p>
                <p className="warning-text">
                  You must be within 20 km to check in
                </p>
                <button
                  onClick={getStudentLocation}
                  className="btn-refresh-location"
                >
                  🔄 Refresh Location
                </button>
              </div>
            )}

            {locationStatus === 'denied' && (
              <div className="location-denied">
                <div className="status-icon">❌</div>
                <p className="status-text">Location access denied</p>
                <p className="status-info">
                  Please enable location permissions in your browser settings
                </p>
                <button
                  onClick={getStudentLocation}
                  className="btn-retry-location"
                >
                  🔄 Try Again
                </button>
              </div>
            )}

            {locationStatus === 'unavailable' && (
              <div className="location-unavailable">
                <div className="status-icon">📵</div>
                <p className="status-text">GPS not available</p>
                <p className="status-info">
                  Your device doesn't support GPS location
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CHECK-IN FORM */}
        <form onSubmit={handleCheckIn} className="checkin-form">
          <div className="form-card">
            <h2>🍽️ Select Meal Type</h2>

            <div className="meal-options">
              <label className="meal-option">
                <input
                  type="radio"
                  name="meal"
                  value="breakfast"
                  checked={mealType === 'breakfast'}
                  onChange={(e) => setMealType(e.target.value)}
                />
                <span className="meal-label">
                  <span className="meal-emoji">🥞</span>
                  <div className="meal-info">
                    <span className="meal-name">Breakfast</span>
                    <span className="meal-time">6:00 AM - 8:00 AM</span>
                  </div>
                </span>
              </label>

              <label className="meal-option">
                <input
                  type="radio"
                  name="meal"
                  value="lunch"
                  checked={mealType === 'lunch'}
                  onChange={(e) => setMealType(e.target.value)}
                />
                <span className="meal-label">
                  <span className="meal-emoji">🍲</span>
                  <div className="meal-info">
                    <span className="meal-name">Lunch</span>
                    <span className="meal-time">12:00 PM - 2:00 PM</span>
                  </div>
                </span>
              </label>

              <label className="meal-option">
                <input
                  type="radio"
                  name="meal"
                  value="dinner"
                  checked={mealType === 'dinner'}
                  onChange={(e) => setMealType(e.target.value)}
                />
                <span className="meal-label">
                  <span className="meal-emoji">🍽️</span>
                  <div className="meal-info">
                    <span className="meal-name">Dinner</span>
                    <span className="meal-time">6:00 PM - 8:00 PM</span>
                  </div>
                </span>
              </label>
            </div>

            {/* ERROR MESSAGE */}
            {error && <div className="error-message">{error}</div>}

            {/* SUCCESS MESSAGE */}
            {success && <div className="success-message">{success}</div>}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className={`btn-checkin ${
                locationStatus !== 'verified' ? 'disabled' : ''
              }`}
              disabled={loading || locationStatus !== 'verified'}
            >
              {loading ? '⏳ Checking in...' : '✅ Check In Now'}
            </button>
          </div>
        </form>

        {/* INFO CARD */}
        <div className="info-card">
          <h3>📌 Important Information</h3>
          <ul>
            <li>✓ You must be within 20 km of Davanagere hostel center to check in</li>
            <li>✓ Location is verified using GPS</li>
            <li>✓ Hostel Center: Davanagere, Karnataka (14.4644°N, 75.9217°E)</li>
            <li>✓ Check-in is only allowed during meal times</li>
            <li>✓ Select your meal preference for each check-in</li>
            <li>✓ Attendance is marked only after successful check-in</li>
            <li>✓ Your location is securely recorded for verification</li>
          </ul>
        </div>

        {/* GEOFENCE INFO CARD */}
        <div className="geofence-card">
          <h3>🗺️ Geofence Details</h3>
          <div className="geofence-details">
            <div className="geofence-item">
              <span className="geofence-label">Radius:</span>
              <span className="geofence-value">20 km</span>
            </div>
            <div className="geofence-item">
              <span className="geofence-label">Center:</span>
              <span className="geofence-value">Davanagere, KA</span>
            </div>
            <div className="geofence-item">
              <span className="geofence-label">Coordinates:</span>
              <span className="geofence-value">14.4644°N, 75.9217°E</span>
            </div>
            {distance && (
              <div className="geofence-item">
                <span className="geofence-label">Your Distance:</span>
                <span className={`geofence-value ${distance <= 20000 ? 'safe' : 'unsafe'}`}>
                  {(distance / 1000).toFixed(2)} km
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCheckInPage;
