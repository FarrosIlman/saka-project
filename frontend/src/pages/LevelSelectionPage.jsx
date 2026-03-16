import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { levelAPI } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import StreakTracker from '../components/gamification/StreakTracker';
import DailyRewardCard from '../components/gamification/DailyRewardCard';
import { 
  LogOut, Lock, CheckCircle2, 
  Trophy, Loader2, Play,
  User as UserIcon, Sparkles, Target, Award, ArrowRight
} from 'lucide-react';

export default function LevelSelectionPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const motivationalQuotes = [
    "Ready to master a new conversation today?",
    "Every word you speak brings you closer to fluency.",
    "Your progress is amazing. Let's keep moving!",
    "Mistakes are proof that you are trying.",
    "Ready to sharpen your skills today?"
  ];

  const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  useEffect(() => { fetchLevels(); }, []);

  const fetchLevels = async () => {
    try {
      const response = await levelAPI.getStudentLevels();
      setLevels(response.data);
    } catch (err) { 
      error('Gagal memuat level.');
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
    if (pos === 0) return 'left';
    if (pos === 1 || pos === 3) return 'center';
    return 'right';
  };

  const styles = `
    .selection-container {
      min-height: 100vh;
      background: #f8fafc;
      background-image: radial-gradient(#e2e8f0 1.2px, transparent 1.2px);
      background-size: 30px 30px;
    }

    .top-nav {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      height: 80px;
      display: flex; justify-content: space-between; align-items: center;
      padding: 0 40px;
      position: sticky; top: 0; z-index: 100;
      border-bottom: 1px solid #e2e8f0;
    }

    @media (max-width: 768px) {
      .top-nav {
        height: 70px;
        padding: 0 16px;
        flex-wrap: wrap;
      }
      .nav-brand span { font-size: 16px; }
      .nav-brand img { width: 36px; }
      .nav-right { gap: 12px; }
      .user-pill { padding: 6px 14px 6px 6px; font-size: 14px; }
    }

    @media (max-width: 480px) {
      .top-nav { padding: 0 12px; }
      .nav-brand span { display: none; }
      .nav-right { gap: 8px; }
    }

    .nav-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .nav-brand img { width: 42px; }
    .nav-brand span { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em; }

    .nav-right { display: flex; align-items: center; gap: 18px; }

    .user-pill {
      display: flex; align-items: center; gap: 12px; padding: 8px 20px 8px 8px;
      background: white; border-radius: 100px; border: 2px solid #f1f5f9;
      cursor: pointer; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .user-pill:hover { border-color: #0ea5e9; transform: translateY(-2px); }
    
    .user-avatar-icon {
      background: #0ea5e9; width: 36px; height: 36px; border-radius: 50%; 
      color: white; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 10px rgba(14, 165, 233, 0.2);
    }
    .user-name { font-size: 14px; font-weight: 800; color: #0f172a; }

    .btn-logout {
      display: flex; align-items: center; gap: 10px; padding: 10px 22px;
      background: #fff1f2; color: #e11d48; border: 2px solid #fecdd3; 
      border-radius: 100px; cursor: pointer; transition: 0.3s;
      font-weight: 500; font-size: 14px;
    }
    .btn-logout:hover {
      background: #e11d48; color: white; border-color: #e11d48;
      transform: translateY(-2px); box-shadow: 0 8px 20px rgba(225, 29, 72, 0.2);
    }

    /* LAYOUT UTAMA */
    .main-layout {
      max-width: 1300px; margin: 0 auto; padding: 40px 32px;
      display: grid; grid-template-columns: 1fr 380px; gap: 50px;
    }

    .path-section { display: flex; flex-direction: column; }
    .level-row { display: flex; width: 100%; margin-bottom: 50px; }
    .level-row.left { justify-content: flex-start; }
    .level-row.center { justify-content: center; }
    .level-row.right { justify-content: flex-end; }

    .level-node { width: 100%; max-width: 350px; position: relative; }
    .level-card {
      background: white; border-radius: 32px; padding: 20px; border: 2.5px solid #f1f5f9;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer;
    }
    .level-node.active .level-card {
      border-color: #0ea5e9; transform: scale(1.05);
      box-shadow: 0 25px 30px -10px rgba(14, 165, 233, 0.15);
    }
    .level-node.completed .level-card { border-color: #10b981; }
    .level-node.locked { opacity: 0.6; cursor: not-allowed; }

    .img-wrapper { width: 100%; height: 150px; border-radius: 22px; overflow: hidden; margin-bottom: 18px; }
    .node-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
    .level-node:hover .node-img { transform: scale(1.1); }

    .action-btn {
      position: absolute; bottom: -15px; right: 28px; width: 56px; height: 56px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 12px 20px rgba(0,0,0,0.12); border: 5px solid white; z-index: 5;
    }
    .btn-play { background: #0ea5e9; color: white; }
    .btn-lock { background: #cbd5e1; color: white; }
    .btn-done { background: #10b981; color: white; }

    .sidebar-section {
      display: flex; flex-direction: column; gap: 24px;
      position: sticky; top: 110px; height: fit-content;
    }

    .sidebar-card {
      background: white; border-radius: 28px; padding: 24px;
      border: 1px solid #f1f5f9; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
    }

    .progress-track { background: #f1f5f9; height: 12px; border-radius: 12px; overflow: hidden; margin: 15px 0; }
    .progress-thumb { 
      background: linear-gradient(90deg, #10b981, #34d399); 
      height: 100%; transition: 1.5s cubic-bezier(0.65, 0, 0.35, 1); 
    }

    @media (max-width: 1100px) {
      .main-layout { grid-template-columns: 1fr; }
      .sidebar-section { position: relative; top: 0; order: -1; }
      .level-row { justify-content: center !important; }
    }
  `;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <Loader2 className="animate-spin text-sky-500" size={50} />
    </div>
  );

  const completedCount = levels.filter(l => l.status === 'completed').length;
  const progressPercent = Math.round((completedCount / levels.length) * 100) || 0;

  return (
    <div className="selection-container">
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="top-nav">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <img src="/saka.png" alt="SAKA" />
          <span>SAKA PATH</span>
        </div>
        
        <div className="nav-right">
          {/* USER PROFILE PILL */}
          <div className="user-pill" onClick={() => navigate('/profile')}>
            <div className="user-avatar-icon">
              <UserIcon size={18} strokeWidth={2.5} />
            </div>
            <span className="user-name">{user?.username}</span>
          </div>

          {/* LOGOUT PILL WITH LABEL */}
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={2.5} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="main-layout">
        <section className="path-section">
          <div style={{ marginBottom: '45px' }}>
            <div style={{ display: 'inline-flex', padding: '8px 18px', background: '#e0f2fe', borderRadius: '100px', color: '#0369a1', fontSize: '13px', fontWeight: '800', marginBottom: '16px' }}>
              <Sparkles size={16} style={{ marginRight: '8px' }} />
              {getGreeting()}, {user?.username}!
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.06em', margin: 0, lineHeight: 1 }}>
              Build Your <span style={{ color: '#0ea5e9' }}>English Skill</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '18px', marginTop: '12px', fontWeight: '600', fontStyle: 'italic' }}>
              "{quote}"
            </p>
          </div>

          {levels.map((level, index) => {
            const isLocked = level.status === 'locked';
            const isCompleted = level.status === 'completed';
            return (
              <div key={level._id} className={`level-row ${getRowClass(index)}`}>
                <div 
                  className={`level-node ${isLocked ? 'locked' : isCompleted ? 'completed' : 'active'}`}
                  onClick={() => !isLocked && navigate(`/quiz/${level.levelNumber}`)}
                >
                  <div className="level-card">
                    <div className="img-wrapper">
                      <img 
                        src={level.imageUrl} 
                        className="node-img" 
                        style={{ filter: isLocked ? 'grayscale(1) opacity(0.4)' : 'none' }} 
                        alt={level.title}
                      />
                    </div>
                    <div style={{ padding: '0 5px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: isLocked ? '#94a3b8' : '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        LEVEL {level.levelNumber}
                      </span>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '6px 0', color: isLocked ? '#94a3b8' : '#0f172a', letterSpacing: '-0.02em' }}>
                        {level.title}
                      </h3>
                      {level.highScore > 0 && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#10b981', background: '#ecfdf5', padding: '5px 12px', borderRadius: '100px', marginTop: '10px', border: '1px solid #d1fae5' }}>
                          <Trophy size={13} /> Score: {level.highScore}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`action-btn ${isLocked ? 'btn-lock' : isCompleted ? 'btn-done' : 'btn-play'}`}>
                    {isLocked ? <Lock size={20} /> : isCompleted ? <CheckCircle2 size={24} /> : <Play size={24} fill="white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <aside className="sidebar-section">
          <DailyRewardCard />
          <StreakTracker />

          <div className="sidebar-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
              <Target size={20} style={{ color: '#0ea5e9' }} /> Mastery Progress
            </h3>
            <div className="progress-track">
              <div className="progress-thumb" style={{ width: `${progressPercent}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800' }}>
              <span style={{ color: '#64748b' }}>{completedCount}/{levels.length} Levels</span>
              <span style={{ color: '#10b981' }}>{progressPercent}%</span>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>
              <Award size={20} style={{ color: '#f59e0b' }} /> Recent Badges
            </h3>
            <BadgeDisplay badges={[]} />
            <button 
              onClick={() => navigate('/profile')}
              style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '16px', background: '#f8fafc', border: '2px solid #f1f5f9', color: '#475569', fontSize: '14px', fontWay: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
            >
              View Full Profile <ArrowRight size={16} />
            </button>
          </div>
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