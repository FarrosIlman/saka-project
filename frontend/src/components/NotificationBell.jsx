import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import '../styles/Notifications.css';

function NotificationBell() {
  const { user } = useAuth();
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/notifications?limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch notifications');

        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to update notification');

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Error updating notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to mark all as read');

      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Error updating notifications');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Error deleting notification');
    }
  };

  if (!user) return null;

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell"
        onClick={() => setShowPanel(!showPanel)}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {showPanel && (
        <div className="notification-panel-wrapper">
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onClose={() => setShowPanel(false)}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
