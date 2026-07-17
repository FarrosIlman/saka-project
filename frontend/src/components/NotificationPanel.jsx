import React from 'react';
import { Bell, X, Check, Trash2, Award, Sparkles, Target, TrendingUp, Megaphone, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationPanel({ notifications = [], unreadCount, onClose, onMarkAsRead, onDelete, onMarkAllAsRead }) {
  const getIcon = (type) => {
    const icons = {
      achievement_unlock: <Award size={20} className="text-amber-500" />,
      level_completed: <Sparkles size={20} className="text-sky-500" />,
      score_milestone: <Target size={20} className="text-rose-500" />,
      leaderboard_change: <TrendingUp size={20} className="text-emerald-500" />,
      announcement: <Megaphone size={20} className="text-blue-500" />,
      course_update: <BookOpen size={20} className="text-purple-500" />,
      reminder: <Clock size={20} className="text-orange-500" />,
    };
    return icons[type] || <Bell size={20} className="text-slate-500" />;
  };

  const getPriorityColor = (priority) => {
    return {
      high: 'bg-rose-500',
      medium: 'bg-amber-500',
      low: 'bg-emerald-500',
    }[priority] || 'bg-sky-500';
  };

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/50">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-slate-900">Notifikasi</h3>
          {unreadCount > 0 && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">{unreadCount} baru</span>}
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
          <button onClick={onMarkAllAsRead} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition-colors">
            <Check size={14} /> Tandai semua dibaca
          </button>
        </div>
      )}

      <div className="overflow-y-auto p-2 space-y-1">
        {notifications.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-slate-400 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Bell size={24} className="opacity-50" />
            </div>
            <p className="font-bold text-sm text-slate-500">Belum ada notifikasi</p>
            <p className="text-xs mt-1">Kamu sudah membaca semuanya!</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, margin: 0 }}
                key={notification._id}
                className={`group relative flex gap-3 p-3 rounded-xl transition-all ${!notification.isRead ? 'bg-sky-50/50 hover:bg-sky-50' : 'bg-transparent hover:bg-slate-50'}`}
              >
                {!notification.isRead && (
                  <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${getPriorityColor(notification.priority)}`} />
                )}
                
                <div className="flex-shrink-0 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xl shadow-sm">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-sm truncate pr-4 ${!notification.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {notification.title}
                    </h4>
                  </div>
                  <p className={`text-xs leading-relaxed mb-2 line-clamp-2 ${!notification.isRead ? 'text-slate-600' : 'text-slate-500'}`}>
                    {notification.message}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {new Date(notification.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <button onClick={() => onMarkAsRead(notification._id)} className="p-1.5 text-sky-500 hover:bg-sky-100 rounded-lg transition-colors" title="Tandai dibaca">
                      <Check size={14} strokeWidth={3} />
                    </button>
                  )}
                  <button onClick={() => onDelete(notification._id)} className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors" title="Hapus">
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
