import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

function NotificationBell() {
  const { user } = useAuth();
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/notifications?limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
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
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to update notification');

      setNotifications((prev) =>
        prev.map((notif) => notif._id === notificationId ? { ...notif, isRead: true } : notif)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toastError('Gagal memperbarui notifikasi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to mark all as read');

      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toastSuccess('Semua notifikasi ditandai dibaca');
    } catch (err) {
      toastError('Gagal memperbarui notifikasi');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      toastSuccess('Notifikasi dihapus');
    } catch (err) {
      toastError('Gagal menghapus notifikasi');
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-2.5 rounded-xl border-2 transition-all ${showPanel ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-200 hover:text-sky-600'}`}
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell size={20} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm shadow-rose-500/40">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 top-14 w-80 sm:w-96 glass-card p-0 overflow-hidden shadow-2xl origin-top-right z-50"
          >
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onClose={() => setShowPanel(false)}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
