import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { levelAPI, gamificationAPI } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import StreakTracker from '../components/gamification/StreakTracker';
import DailyRewardCard from '../components/gamification/DailyRewardCard';
import LeaderboardWidget from '../components/gamification/LeaderboardWidget';
import DailyQuestsWidget from '../components/gamification/DailyQuestsWidget';
import LevelMaterialModal from '../components/modals/LevelMaterialModal';
import HeartRefillModal from '../components/modals/HeartRefillModal';
import { OnboardingTutorial } from '../components/gamification/OnboardingTutorial';
import { motion } from 'framer-motion';
import { 
  LogOut, Lock, CheckCircle2, 
  Trophy, Loader2, Play,
  User as UserIcon, Sparkles, Target, Award, ArrowRight, ArrowLeft,
  Heart, Coins, Home, Flame, ClipboardList
} from 'lucide-react';

export default function LevelSelectionPage() {
  const [levels, setLevels] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('home'); // 'home', 'quests', 'leaderboard', 'profile'
  const [showHeartModal, setShowHeartModal] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [nextRegenTime, setNextRegenTime] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { user, logout, isAdmin, completeTutorial } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const motivationalQuotes = [
    "Ready to conquer new challenges today?",
    "Every word you speak brings you closer to fluency.",
    "Your learning progress is amazing! Let's keep moving forward.",
    "Mistakes are proof that you are trying.",
    "Let's aim for a perfect score today!"
  ];

  const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  useEffect(() => { fetchLevelsAndBadges(); }, []);

  const fetchLevelsAndBadges = async () => {
    try {
      const [levelsRes, badgesRes, heartsRes] = await Promise.all([
        levelAPI.getStudentLevels(),
        gamificationAPI.getBadges(),
        gamificationAPI.getHeartStatus()
      ]);
      setLevels(levelsRes.data);
      setBadges(badgesRes.data.badges || []);
      setHearts(heartsRes.data.hearts);
      setNextRegenTime(heartsRes.data.nextRegenTime);
    } catch (err) { 
      error('Failed to load dashboard data.');
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    success('Successfully logged out!');
    navigate('/');
  };

  const getTransformClass = (index) => {
    const sequence = [
      '', 
      'lg:translate-x-[120px]', 
      'lg:translate-x-[180px]', 
      'lg:translate-x-[120px]', 
      '', 
      'lg:-translate-x-[120px]', 
      'lg:-translate-x-[180px]', 
      'lg:-translate-x-[120px]'
    ];
    return sequence[index % sequence.length];
  };

  const handleLevelClick = (level) => {
    if (level.status === 'locked') return;
    if (hearts <= 0) {
      setShowHeartModal(true);
      return;
    }
    if (level.materialText && level.materialText.trim() !== '') {
      setSelectedLevel(level);
    } else {
      navigate(`/quiz/${level.levelNumber}`);
    }
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
            {/* HEARTS PILL */}
            <motion.div 
              id="tutorial-target-hearts"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHeartModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-rose-50 rounded-full border-2 border-rose-100 hover:border-rose-300 cursor-pointer transition-colors"
            >
              <Heart size={16} className="text-rose-500 sm:w-[18px] sm:h-[18px]" fill="currentColor" />
              <span className="font-black text-rose-600 text-sm sm:text-base">{hearts}</span>
            </motion.div>

            {/* POINTS PILL */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-amber-50 rounded-full border-2 border-amber-100"
            >
              <Coins size={16} className="text-amber-500 sm:w-[18px] sm:h-[18px]" fill="currentColor" />
              <span className="font-black text-amber-600 text-sm sm:text-base">{user?.totalPoints || 0}</span>
            </motion.div>

            {/* USER PROFILE PILL - Desktop Only */}
            <motion.div 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="hidden lg:flex items-center gap-3 px-2 pr-5 py-1.5 bg-white rounded-full border-2 border-slate-100 hover:border-sky-400 cursor-pointer shadow-sm transition-colors"
              onClick={() => navigate('/profile')}
            >
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-inner shadow-sky-400/50">
                <UserIcon size={18} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-sm text-slate-800">{user?.username}</span>
            </motion.div>

            {/* LOGOUT PILL - Desktop Only */}
            <motion.button 
              whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(225, 29, 72, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-rose-50 text-rose-600 font-bold border-2 border-rose-200 rounded-full hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-24 lg:pb-0">
        
        {/* Main Content (Map) */}
        <section className={`lg:col-span-8 order-2 lg:order-1 ${activeMobileTab !== 'home' ? 'hidden lg:block' : ''}`}>
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
              className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2"
            >
              Continue <span className="text-sky-500">Your Mission</span>
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

            <div className="flex flex-col gap-8 relative">
            {/* Path Line (Saga Map visual) */}
            <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-4 bg-slate-200/50 rounded-full -z-10 shadow-inner">
              <div className="w-full h-full bg-gradient-to-b from-sky-400 to-sky-200 rounded-full opacity-50"></div>
            </div>

            {Object.keys(levels.reduce((acc, level) => {
              const phase = level.phase || 1;
              if (!acc[phase]) acc[phase] = [];
              acc[phase].push(level);
              return acc;
            }, {})).sort((a, b) => Number(a) - Number(b)).map(phase => (
              <div key={`phase-${phase}`} className="relative mb-12">
                <div className="flex justify-center mb-6 relative z-10">
                   <div className="bg-sky-500 text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-black text-sm sm:text-base shadow-md shadow-sky-500/30 border-2 border-white flex items-center gap-2">
                     <Target size={18} /> Phase {phase}
                   </div>
                </div>
                <div className="flex flex-col gap-6 sm:gap-8 relative">
                  {levels.filter(l => (l.phase || 1) === Number(phase)).map((level, index) => {
                    const isLocked = level.status === 'locked';
                    const isCompleted = level.status === 'completed';
                    
                    return (
              <div key={level._id} className={`flex justify-center w-full transition-transform duration-500 ${getTransformClass(index)}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="w-full flex justify-center"
                >
                  <motion.div 
                    id={index === 0 && phase == 1 ? "tutorial-target-level" : undefined}
                    whileHover={!isLocked ? { scale: 1.05, y: -4 } : {}}
                    className={`relative w-full max-w-[260px] sm:max-w-[280px] ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => handleLevelClick(level)}
                  >
                    <div className={`glass-card p-3.5 transition-all duration-300 border-2 ${
                      isCompleted ? 'border-emerald-400' : 
                      isLocked ? 'border-slate-200' : 'border-sky-400 shadow-sky-100'
                    }`}>
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-3 relative group">
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
                        <h3 className={`text-lg font-bold mt-1 mb-2 leading-tight ${
                          isLocked ? 'text-slate-500' : 'text-slate-900'
                        }`}>
                          {level.title}
                        </h3>
                        
                        {level.highScore > 0 && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold">
                            <Trophy size={12} /> Score: {level.highScore}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className={`absolute -bottom-3 -right-3 w-12 h-12 rounded-full border-4 border-slate-50 flex items-center justify-center shadow-lg z-10 ${
                      isLocked ? 'bg-slate-300 text-slate-500' : 
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white shadow-sky-500/40'
                    }`}>
                      {isLocked ? <Lock size={18} /> : isCompleted ? <CheckCircle2 size={20} /> : <Play size={20} className="ml-1" fill="currentColor" />}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
              );
            })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-6 lg:sticky lg:top-28 lg:h-fit">
          
          <div className={`${activeMobileTab !== 'quests' ? 'hidden lg:block' : ''}`}>
            <div className="flex flex-col gap-6">
              <DailyRewardCard />
              <div id="tutorial-target-quests">
                <DailyQuestsWidget />
              </div>
            </div>
          </div>

          <div className={`${activeMobileTab !== 'leaderboard' ? 'hidden lg:block' : ''}`}>
             <div className="flex flex-col gap-6">
                <StreakTracker />
                <LeaderboardWidget />
             </div>
          </div>

          <div className={`${activeMobileTab !== 'profile' ? 'hidden lg:block' : ''}`}>
            <div className="flex flex-col gap-6">
              {/* Profile Header for Mobile Only */}
              <div className="lg:hidden glass-card p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-sky-500/30">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{user?.username}</h2>
                    <p className="text-slate-500 font-medium">{user?.totalXP || 0} XP</p>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6"
              >
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-4">
              <Target size={22} className="text-sky-500" /> Mastery Progress
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
              <span className="text-slate-500">{completedCount} of {levels.length} Levels</span>
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
              <Award size={22} className="text-amber-500" /> Latest Badges
            </h3>
            <BadgeDisplay badges={badges} />
            
            <button 
              onClick={() => navigate('/profile')}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              View Full Profile <ArrowRight size={18} />
            </button>
            
            {/* Mobile Logout Button */}
            <button 
              onClick={handleLogout}
              className="lg:hidden w-full mt-4 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors"
            >
              <LogOut size={18} strokeWidth={2.5} />
              Logout
            </button>
          </motion.div>
            </div>
          </div>
        </aside>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 relative px-2">
          
          {/* Target for tutorial: Highlights both Quests and Rankings (center of the screen) */}
          <div id="tutorial-target-quests-mobile" className="absolute left-[25%] right-[25%] top-1 bottom-1 pointer-events-none"></div>
          
          <button 
            onClick={() => setActiveMobileTab('home')}
            className="relative flex flex-col items-center w-full h-full"
          >
            <div className={`absolute transition-all duration-300 ease-out flex items-center justify-center rounded-full z-20 ${
              activeMobileTab === 'home' 
                ? '-top-4 w-[50px] h-[50px] bg-sky-500 text-white border-[4px] border-white shadow-sm' 
                : 'top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 bg-transparent border-0'
            }`}>
              <Home size={22} strokeWidth={activeMobileTab === 'home' ? 2.5 : 2} />
            </div>
            <span className={`absolute bottom-1.5 text-[10px] font-black transition-all duration-300 ease-out ${
              activeMobileTab === 'home' 
                ? 'translate-y-0 opacity-100 text-sky-500' 
                : 'translate-y-4 opacity-0 text-slate-400'
            }`}>
              Learn
            </span>
          </button>

          <button 
            onClick={() => setActiveMobileTab('quests')}
            className="relative flex flex-col items-center w-full h-full"
          >
            <div className={`absolute transition-all duration-300 ease-out flex items-center justify-center rounded-full z-20 ${
              activeMobileTab === 'quests' 
                ? '-top-4 w-[50px] h-[50px] bg-sky-500 text-white border-[4px] border-white shadow-sm' 
                : 'top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 bg-transparent border-0'
            }`}>
              <ClipboardList size={22} strokeWidth={activeMobileTab === 'quests' ? 2.5 : 2} />
            </div>
            <span className={`absolute bottom-1.5 text-[10px] font-black transition-all duration-300 ease-out ${
              activeMobileTab === 'quests' 
                ? 'translate-y-0 opacity-100 text-sky-500' 
                : 'translate-y-4 opacity-0 text-slate-400'
            }`}>
              Quests
            </span>
          </button>

          <button 
            onClick={() => setActiveMobileTab('leaderboard')}
            className="relative flex flex-col items-center w-full h-full"
          >
            <div className={`absolute transition-all duration-300 ease-out flex items-center justify-center rounded-full z-20 ${
              activeMobileTab === 'leaderboard' 
                ? '-top-4 w-[50px] h-[50px] bg-sky-500 text-white border-[4px] border-white shadow-sm' 
                : 'top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 bg-transparent border-0'
            }`}>
              <Trophy size={22} strokeWidth={activeMobileTab === 'leaderboard' ? 2.5 : 2} />
            </div>
            <span className={`absolute bottom-1.5 text-[10px] font-black transition-all duration-300 ease-out ${
              activeMobileTab === 'leaderboard' 
                ? 'translate-y-0 opacity-100 text-sky-500' 
                : 'translate-y-4 opacity-0 text-slate-400'
            }`}>
              Rankings
            </span>
          </button>

          <button 
            onClick={() => setActiveMobileTab('profile')}
            className="relative flex flex-col items-center w-full h-full"
          >
            <div className={`absolute transition-all duration-300 ease-out flex items-center justify-center rounded-full z-20 ${
              activeMobileTab === 'profile' 
                ? '-top-4 w-[50px] h-[50px] bg-sky-500 text-white border-[4px] border-white shadow-sm' 
                : 'top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 bg-transparent border-0'
            }`}>
              <UserIcon size={22} strokeWidth={activeMobileTab === 'profile' ? 2.5 : 2} />
            </div>
            <span className={`absolute bottom-1.5 text-[10px] font-black transition-all duration-300 ease-out ${
              activeMobileTab === 'profile' 
                ? 'translate-y-0 opacity-100 text-sky-500' 
                : 'translate-y-4 opacity-0 text-slate-400'
            }`}>
              Profile
            </span>
          </button>

        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Are you sure you want to log out?"
        message="Your daily streak will be maintained if you have completed today's mission."
        onConfirm={confirmLogout}
        onClose={() => setShowLogoutModal(false)}
        confirmText="Yes, Log Out"
        type="warning"
      />

      <HeartRefillModal 
        isOpen={showHeartModal}
        onClose={() => setShowHeartModal(false)}
        userPoints={user?.totalPoints || 0}
        nextRegenTime={nextRegenTime}
        onRefillSuccess={(newHearts, newPoints) => {
          setHearts(newHearts);
          setNextRegenTime(null);
          // Optional: Update user context totalPoints if needed
        }}
      />

      <LevelMaterialModal
        isOpen={!!selectedLevel}
        onClose={() => setSelectedLevel(null)}
        level={selectedLevel}
        onStartQuiz={() => {
          if (selectedLevel) navigate(`/quiz/${selectedLevel.levelNumber}`);
        }}
      />

      {/* Onboarding Tutorial Modal for New Users */}
      {user && !user.hasCompletedTutorial && (
        <OnboardingTutorial onComplete={completeTutorial} />
      )}
    </div>
  );
}