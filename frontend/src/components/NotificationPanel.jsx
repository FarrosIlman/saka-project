import React, { useContext } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import '../styles/Notifications.css';

function NotificationPanel({ notifications = [], unreadCount, onClose, onMarkAsRead, onDelete, onMarkAllAsRead }) {
  const getIcon = (type) => {
    const icons = {
      achievement_unlock: '🏆',
      level_completed: '✨',
      score_milestone: '🎯',
      leaderboard_change: '📈',
      announcement: '📢',
      course_update: '📚',
      reminder: '⏰',
    };
    return icons[type] || '📬';
  };

  const getPriorityColor = (priority) => {
    return {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    }[priority] || '#0ea5e9';
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <div className="notification-title">
          <h3>Notifications</h3>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {unreadCount > 0 && (
        <button className="mark-all-btn" onClick={onMarkAllAsRead}>
          <Check size={16} /> Mark all as read
        </button>
      )}

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={40} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              style={{ borderLeftColor: getPriorityColor(notification.priority) }}
            >
              <div className="notification-content">
                <div className="notification-icon">{getIcon(notification.type)}</div>
                <div className="notification-text">
                  <div className="notification-title-text">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="action-btn"
                    onClick={() => onMarkAsRead(notification._id)}
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  className="action-btn delete"
                  onClick={() => onDelete(notification._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
