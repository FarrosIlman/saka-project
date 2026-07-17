import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI, progressAPI } from '../services/api';
import { AchievementBadge } from '../components/AchievementBadge';
import { ExportButton } from '../components/ExportButton';
import { SkeletonCard, SkeletonLoader } from '../components/SkeletonLoader';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Mail, Calendar, Trophy, Target,
  Lock, Eye, EyeOff, Loader2, Save, LogOut, Zap, TrendingUp, Award, Download
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchProgress();
    fetchAchievements();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfileData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Fallback data
      setProfileData({
        username: user?.username || 'User',
        email: 'user@saka.local',
        createdAt: new Date().toISOString(),
        totallevelsCompleted: 0,
        averageScore: 0,
        streak: 0,
      });
      if (err.status !== 404) {
        showError(err.message || 'Gagal memuat profil');
      }
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await progressAPI.getProgress();
      const chartData = response.data?.levelProgress?.map((level, idx) => ({
        name: `Level ${level.levelNumber}`,
        score: level.highScore || 0,
        status: level.status,
        attempts: level.attempts || 1
      })) || [];
      setProgressData({ levelProgress: chartData, raw: response.data });
    } catch (err) {
      console.error('Failed to load progress:', err);
      setProgressData({ levelProgress: [], raw: null });
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await progressAPI.getAchievements(user._id);
      setAchievements(response.data || []);
    } catch (err) {
      console.error('Failed to load achievements:', err);
      setAchievements([]);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Password baru tidak cocok');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showError('Password minimal 6 karakter');
      return;
    }

    setUpdating(true);
    try {
      await userAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      success('Password berhasil diubah!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      showError(err.message || 'Gagal mengubah password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    success('Berhasil keluar. Sampai jumpa!');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="w-48 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <SkeletonCard count={3} />
        </div>
      </div>
    );
  }

  const joinDate = profileData?.createdAt 
    ? new Date(profileData.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 bg-grid-pattern pb-20">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-sky-200/40 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 left-0 w-96 h-96 rounded-full bg-emerald-200/40 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <button 
            onClick={() => navigate('/levels')}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-200 rounded-xl text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Profil Saya</h1>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          {/* User Info Card */}
          <motion.div variants={itemVariants} className="glass-card p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">
              <User size={20} className="text-sky-500" />
              Informasi Akun
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Username</p>
                <p className="text-lg font-black text-slate-900 truncate">{profileData?.username}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                <p className="text-base font-bold text-slate-900 truncate">{profileData?.email || 'Belum diset'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Bergabung</p>
                <p className="text-sm font-bold text-slate-900">{joinDate}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                <p className="text-lg font-black text-emerald-600">Aktif</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-5 rounded-2xl text-white text-center shadow-lg shadow-emerald-500/30 transform transition-transform hover:-translate-y-1">
                <span className="block text-3xl font-black mb-1">{profileData?.totallevelsCompleted || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Level Selesai</span>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-5 rounded-2xl text-white text-center shadow-lg shadow-amber-500/30 transform transition-transform hover:-translate-y-1">
                <span className="block text-3xl font-black mb-1">{profileData?.averageScore || 0}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Rata-rata Skor</span>
              </div>
              <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-5 rounded-2xl text-white text-center shadow-lg shadow-sky-500/30 transform transition-transform hover:-translate-y-1">
                <span className="block text-3xl font-black mb-1">{profileData?.streak || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Hari Beruntun</span>
              </div>
            </div>
          </motion.div>

          {/* Progress Chart Card */}
          {progressData && progressData.levelProgress.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-5 sm:p-6">
              <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">
                <TrendingUp size={20} className="text-indigo-500" />
                Grafik Progres
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Score Per Level</p>
                  {progressData.levelProgress.every(l => l.score === 0) ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                      <Award size={32} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium">Belum ada skor tercatat.</p>
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={progressData.levelProgress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="score" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Tren Pembelajaran</p>
                  {progressData.levelProgress.every(l => l.score === 0) ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                      <TrendingUp size={32} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium">Belum ada tren tercatat.</p>
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressData.levelProgress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value}%`, 'Score']} />
                          <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#059669' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievements */}
          {achievements && (
            <motion.div variants={itemVariants} className="glass-card p-5 sm:p-6">
              <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">
                <Trophy size={20} className="text-amber-500" />
                Prestasi & Lencana
              </h2>
              
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {achievements.map((achievement) => (
                    <AchievementBadge key={achievement._id} achievement={achievement} isUnlocked={true} />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                    <Trophy size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Belum Ada Prestasi</h3>
                  <p className="text-sm text-slate-500">Selesaikan kuis dengan skor sempurna untuk membuka lencana pertamamu!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Settings & Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="glass-card p-5 sm:p-6">
              <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">
                <Lock size={20} className="text-rose-500" />
                Keamanan
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-sky-500 transition-colors"
                      required disabled={updating}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-sky-500 transition-colors"
                      required disabled={updating}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-3 text-slate-400 hover:text-slate-600">
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-sky-500 transition-colors"
                      required disabled={updating}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" disabled={updating || !passwordForm.currentPassword || !passwordForm.newPassword} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50">
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-5 sm:p-6 flex flex-col">
              <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">
                <Download size={20} className="text-emerald-500" />
                Data & Akun
              </h2>
              
              <div className="flex-1">
                <p className="text-slate-600 mb-4">Unduh seluruh laporan progres belajar dan pencapaian Anda dalam format CSV.</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Laporan Progres</p>
                      <p className="text-xs text-slate-500">Format .csv (Spreadsheet)</p>
                    </div>
                  </div>
                  <ExportButton exportType="progress-csv" variant="default" />
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-200">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-50 border-2 border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
                >
                  <LogOut size={18} />
                  Keluar dari Akun
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
