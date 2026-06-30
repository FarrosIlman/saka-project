import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { levelAPI, gamificationAPI } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import StreakTracker from '../components/gamification/StreakTracker';
import DailyRewardCard from '../components/gamification/DailyRewardCard';
import { motion } from 'framer-motion';
import { 
  LogOut, Lock, CheckCircle2, 
  Trophy, Loader2, Play,
  User as UserIcon, Sparkles, Target, Award, ArrowRight, ArrowLeft
} from 'lucide-react';

export default function LevelSelectionPage() {
  const [levels, setLevels] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    return "Selamat Malam";
  };

  const motivationalQuotes = [
    "Siap menaklukkan tantangan baru hari ini?",
    "Setiap kata yang kamu ucapkan membawamu lebih dekat pada kefasihan.",
    "Progres belajarmu luar biasa! Ayo kita terus maju.",
    "Kesalahan adalah bukti bahwa kamu sedang belajar.",
    "Ayo kumpulkan skor sempurna hari ini!"
  ];

  const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  useEffect(() => { fetchLevelsAndBadges(); }, []);

  const fetchLevelsAndBadges = async () => {
    try {
      const [levelsRes, badgesRes] = await Promise.all([
        levelAPI.getStudentLevels(),
        gamificationAPI.getBadges()
      ]);
      setLevels(levelsRes.data);
      setBadges(badgesRes.data.badges || []);
    } catch (err) { 
      error('Gagal memuat data level dan badge.');
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    success('Berhasil keluar!');
    navigate('/');
  };

  const getRowClass = (index) => {
    const pos = index % 4;
    if (pos === 0) return 'justify-start';
    if (pos === 1 || pos === 3) return 'justify-center';
    return 'justify-end';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <Loader2 className="animate-spin text-sky-500" size={50} />
    </div>
  );

  const completedCount = levels.filter(l => l.status === 'completed').length;
  const progressPercent = Math.round((completedCount / levels.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-slate-50 bg-grid-pattern relative overflow-x-hidden pb-20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-sky-200/30 mix-blend-multiply filter blur-3xl animate-blob"></div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* BACK BUTTON FOR ADMIN */}
            {isAdmin() && location.pathname === '/admin/view-student' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 font-bold rounded-xl border-2 border-sky-100 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all active:scale-95"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/saka.png" alt="SAKA" className="w-10 sm:w-12 drop-shadow-sm" />
              <span className="hidden sm:block text-xl font-black text-slate-900 tracking-tight">SAKA PATH</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* USER PROFILE PILL */}
            <motion.div 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-2 pr-5 py-1.5 bg-white rounded-full border-2 border-slate-100 hover:border-sky-400 cursor-pointer shadow-sm transition-colors"
              onClick={() => navigate('/profile')}
            >
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-inner shadow-sky-400/50">
                <UserIcon size={18} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-sm text-slate-800">{user?.username}</span>
            </motion.div>

            {/* LOGOUT PILL */}
            <motion.button 
              whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(225, 29, 72, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-rose-50 text-rose-600 font-bold border-2 border-rose-200 rounded-full hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content (Map) */}
        <section className="lg:col-span-8 order-2 lg:order-1">
          <div className="mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full text-sky-700 text-sm font-bold mb-4"
            >
              <Sparkles size={16} />
              {getGreeting()}, {user?.username}!
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2"
            >
              Lanjutkan <span className="text-sky-500">Misi Belajarmu</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-medium text-slate-500 italic"
            >
              "{quote}"
            </motion.p>
          </div>

          <div className="flex flex-col gap-10 relative">
            {/* SVG Path Line connecting levels (Visual Only) */}
            <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-1 border-l-4 border-dashed border-sky-200 -z-10 hidden md:block"></div>

            {levels.map((level, index) => {
              const isLocked = level.status === 'locked';
              const isCompleted = level.status === 'completed';
              
              return (
                <motion.div 
                  key={level._id} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex w-full ${getRowClass(index)}`}
                >
                  <motion.div 
                    whileHover={!isLocked ? { scale: 1.03, y: -5 } : {}}
                    className={`relative w-full max-w-[320px] ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !isLocked && navigate(`/quiz/${level.levelNumber}`)}
                  >
                    <div className={`glass-card p-4 transition-all duration-300 border-2 ${
                      isCompleted ? 'border-emerald-400' : 
                      isLocked ? 'border-slate-200' : 'border-sky-400 shadow-sky-100'
                    }`}>
                      <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 relative group">
                        <img 
                          src={level.imageUrl} 
                          alt={level.title}
                          className={`w-full h-full object-cover transition-transform duration-700 ${
                            isLocked ? 'grayscale' : 'group-hover:scale-110'
                          }`}
                        />
                        {isLocked && <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>}
                      </div>
                      
                      <div className="px-2 pb-2">
                        <span className={`text-xs font-black uppercase tracking-wider ${
                          isLocked ? 'text-slate-400' : 'text-sky-500'
                        }`}>
                          LEVEL {level.levelNumber}
                        </span>
                        <h3 className={`text-xl font-bold mt-1 mb-3 ${
                          isLocked ? 'text-slate-500' : 'text-slate-900'
                        }`}>
                          {level.title}
                        </h3>
                        
                        {level.highScore > 0 && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold">
                            <Trophy size={14} /> Score: {level.highScore}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className={`absolute -bottom-4 -right-4 w-14 h-14 rounded-full border-4 border-slate-50 flex items-center justify-center shadow-lg z-10 ${
                      isLocked ? 'bg-slate-300 text-slate-500' : 
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white shadow-sky-500/40'
                    }`}>
                      {isLocked ? <Lock size={20} /> : isCompleted ? <CheckCircle2 size={24} /> : <Play size={24} className="ml-1" fill="currentColor" />}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-6 lg:sticky lg:top-28 lg:h-fit">
          <DailyRewardCard />
          <StreakTracker />

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-4">
              <Target size={22} className="text-sky-500" /> Progres Mastery
            </h3>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-2 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              />
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-500">{completedCount} dari {levels.length} Level</span>
              <span className="text-emerald-500">{progressPercent}%</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-6">
              <Award size={22} className="text-amber-500" /> Lencana Terbaru
            </h3>
            <BadgeDisplay badges={badges} />
            
            <button 
              onClick={() => navigate('/profile')}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Lihat Profil Lengkap <ArrowRight size={18} />
            </button>
          </motion.div>
        </aside>
      </main>

      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Yakin ingin keluar?"
        message="Daily streak kamu akan tetap terjaga jika kamu sudah menyelesaikan misi hari ini."
        onConfirm={confirmLogout}
        onClose={() => setShowLogoutModal(false)}
        confirmText="Ya, Logout"
        type="warning"
      />
    </div>
  );
}