import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/NotificationsPage.css';

function NotificationsPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([
        {
          _id: '1',
          title: 'Welcome!',
          message: 'Welcome to Smart Notifications',
          severity: 'info',
          read: false,
          createdAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'CRITICAL': return '🚨';
      case 'WARNING': return '⚠️';
      case 'ALERT': return '🔔';
      case 'INFO': return 'ℹ️';
      default: return '📢';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.severity === filter);

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <nav className="navbar">
        <div className="nav-brand">🏫 Hostel Management</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="notifications-container">
        <div className="notifications-header">
          <h1>🔔 Smart Notifications</h1>
          <p>AI-powered alerts for your hostel</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Back
          </button>
        </div>

        <div className="notifications-controls">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
              onClick={() => setFilter('critical')}
            >
              🚨 Critical ({notifications.filter(n => n.severity === 'critical').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
              onClick={() => setFilter('warning')}
            >
              ⚠️ Warning ({notifications.filter(n => n.severity === 'warning').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
              onClick={() => setFilter('info')}
            >
              ℹ️ Info ({notifications.filter(n => n.severity === 'info').length})
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <p>✨ All caught up! No notifications.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-card ${notification.severity} ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  
                  {notification.details && (
                    <div className="notification-details">
                      {Object.entries(notification.details).map(([key, value]) => (
                        <span key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="notification-meta">
                    <span className="timestamp">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <span className={`severity-badge ${notification.severity}`}>
                      {notification.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button 
                      className="action-btn read"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(notification._id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="notification-legend">
        <h4>Notification Types:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="badge critical">🚨 CRITICAL</span>
            <span>Immediate action required</span>
          </div>
          <div className="legend-item">
            <span className="badge warning">⚠️ WARNING</span>
            <span>Important attention needed</span>
          </div>
          <div className="legend-item">
            <span className="badge info">ℹ️ INFO</span>
            <span>General information</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;