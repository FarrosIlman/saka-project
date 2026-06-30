import React, { useState, useEffect } from 'react';
import { 
  Edit3, Lock, Settings, Mail, User as UserIcon, 
  Calendar, Trophy, Target, Zap, Shield, ArrowLeft, Loader2, Award, BookOpen, Star, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { ExportButton } from '../components/ExportButton';
import ProfileEditModal from '../components/modals/ProfileEditModal';
import PasswordChangeModal from '../components/modals/PasswordChangeModal';
import UserSettingsModal from '../components/modals/UserSettingsModal';
import { motion } from 'framer-motion';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setActiveModal(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-sky-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-mesh-pattern opacity-40 pointer-events-none z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-sky-300/20 mix-blend-multiply filter blur-3xl animate-blob pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/levels')} 
              className="p-3 bg-white border-2 border-slate-200 rounded-full text-slate-700 hover:border-sky-400 hover:text-sky-500 shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft size={24} strokeWidth={2.5} /> 
            </button>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h2>
          </div>
          <div className="flex gap-2 items-center text-slate-500 font-bold text-sm tracking-widest uppercase bg-white/60 px-4 py-2 rounded-full border border-slate-200 backdrop-blur-md">
            <Sparkles size={16} className="text-amber-500" /> SAKA Personal Dashboard
          </div>
        </motion.div>

        {/* Hero Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="glass-card bg-white/90 p-8 sm:p-12 mb-8 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-100/50 to-transparent"></div>
          
          <div className="relative mb-6 z-10">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-xl shadow-sky-500/20">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                className="w-full h-full rounded-full border-4 border-white object-cover bg-white"
                alt="Profile"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-4 border-white text-white flex items-center justify-center shadow-lg">
              {user.role === 'admin' ? <Shield size={18} fill="currentColor" /> : <Star size={18} fill="currentColor" />}
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 z-10">{user.fullName || user.username}</h1>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 border border-sky-100 rounded-full text-sky-600 text-xs font-black uppercase tracking-widest mb-6 z-10">
            <Award size={14} strokeWidth={3} /> Member of SAKA Path
          </div>

          <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 z-10">
            Lihat progres belajar dan atur akun kamu di sini. Terus belajar untuk hasil terbaik!
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center z-10">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all" onClick={() => setActiveModal('edit')}>
              <Edit3 size={18} /> Edit Profile
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-full font-bold hover:border-slate-300 hover:bg-slate-50 transition-all" onClick={() => setActiveModal('password')}>
              <Lock size={18} /> Password
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-full font-bold hover:border-slate-300 hover:bg-slate-50 transition-all" onClick={() => setActiveModal('settings')}>
              <Settings size={18} /> Settings
            </button>
          </div>
        </motion.div>

        {/* Stats Section (Students Only) */}
        {user.role === 'student' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="glass-card bg-white/90 p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform group">
              <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={28} />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-1">{user.totallevelsCompleted || 0}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Levels Done</div>
            </div>

            <div className="glass-card bg-white/90 p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform group">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap size={28} fill="currentColor" />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-1">{user.totalXP || 0}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total XP</div>
            </div>

            <div className="glass-card bg-white/90 p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy size={28} />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-1">{user.averageScore || 0}%</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Accuracy</div>
            </div>
          </motion.div>
        )}

        {/* Details Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          
          <div className="glass-card bg-white/90 p-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-2">
              <UserIcon size={24} className="text-indigo-500" /> Account Details
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-6">Data akun pribadimu di SAKA.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Registered Email</p>
                  <p className="font-bold text-slate-700">{user.email || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Joined Since</p>
                  <p className="font-bold text-slate-700">
                    {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card bg-white/90 p-8 flex flex-col">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-2">
              <Award size={24} className="text-rose-500" /> About Me
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-6">Bio singkat mengenai belajarmu.</p>
            
            {user.bio ? (
              <div className="flex-1 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium italic mb-6">
                "{user.bio}"
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mb-6 min-h-[120px]">
                <p className="font-bold">Belum ada bio.</p>
                <p className="text-sm">Tambahkan bio di pengaturan profil.</p>
              </div>
            )}
            
            <div className="mt-auto">
              <ExportButton exportType={user.role === 'admin' ? 'users-csv' : 'progress-csv'} variant="default" />
            </div>
          </div>

        </motion.div>
      </div>

      {activeModal === 'edit' && <ProfileEditModal user={user} onClose={() => setActiveModal(null)} onUpdate={handleProfileUpdate} />}
      {activeModal === 'password' && <PasswordChangeModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'settings' && <UserSettingsModal user={user} onClose={() => setActiveModal(null)} onUpdate={handleProfileUpdate} />}
    </div>
  );
}