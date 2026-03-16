import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import socketService from '../../services/socketService';
import './RealtimeNotificationIndicator.css';

const RealtimeNotificationIndicator = ({ userId }) => {
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to real-time notifications
    const handleNewNotification = (notification) => {
      const notificationWithId = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };

      setActiveNotifications((prev) => [notificationWithId, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Auto-remove notification after 5 seconds
      const timer = setTimeout(() => {
        setActiveNotifications((prev) =>
          prev.filter((n) => n.id !== notificationWithId.id)
        );
      }, 5000);

      return () => clearTimeout(timer);
    };

    // Listen for connection status
    const handleConnectionChange = (connected) => {
      setIsLiveConnected(connected);
    };

    // Subscribe via socket service
    socketService.on('new-notification', handleNewNotification);

    // Check if already connected
    setIsLiveConnected(socketService.isConnected());

    return () => {
      socketService.off('new-notification', handleNewNotification);
    };
  }, [userId]);

  const handleClearNotifications = () => {
    setActiveNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'info':
      default:
        return 'notification-info';
    }
  };

  return (
    <div className="realtime-notification-indicator">
      {/* Connection Status Indicator */}
      <div className={`connection-status ${isLiveConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {isLiveConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Notifications Container */}
      <div className="notifications-container">
        {activeNotifications.length > 0 && (
          <div className="notifications-header">
            <div className="notifications-info">
              <Bell size={16} />
              <span>{unreadCount} new</span>
            </div>
            <button
              onClick={handleClearNotifications}
              className="clear-btn"
              aria-label="Clear notifications"
            >
              ✕
            </button>
          </div>
        )}

        <div className="notifications-list">
          {activeNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${getNotificationStyle(notification.type || 'info')}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p className="notification-title">
                  {notification.title || 'Notification'}
                </p>
                {notification.message && (
                  <p className="notification-message">{notification.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {activeNotifications.length === 0 && (
          <div className="no-notifications">
            <Bell size={24} />
            <p>No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeNotificationIndicator;
