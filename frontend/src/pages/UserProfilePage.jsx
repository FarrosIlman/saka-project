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

  const styles = `
    .profile-page {
      min-height: 100vh;
      background: #f8fafc;
      background-image: radial-gradient(#e2e8f0 1.2px, transparent 1.2px);
      background-size: 30px 30px;
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .profile-container {
      width: 100%;
      max-width: 850px;
      position: relative;
    }

    /* HEADER TOP AREA - DIPASTIKAN MUNCUL */
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 30px;
      z-index: 50;
    }

    .page-title-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* TOMBOL KEMBALI BULAT SEMPURNA */
    .btn-back-profile {
      background: white; 
      border: 1.5px solid #e2e8f0; 
      width: 54px; 
      height: 54px; 
      border-radius: 50%; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
      transition: all 0.3s ease;
      color: #0f172a; 
      padding: 0;
      flex-shrink: 0;
    }
    .btn-back-profile:hover { border-color: #0ea5e9; color: #0ea5e9; transform: translateX(-4px); }

    .page-label {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    /* MAIN CARD */
    .profile-card-main {
      background: white;
      border-radius: 32px;
      border: 1px solid #f1f5f9;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04);
      padding: 40px;
      margin-bottom: 24px;
      animation: slideUp 0.5s ease-out;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    .profile-hero { display: flex; flex-direction: column; align-items: center; text-align: center; }

    .avatar-wrapper { position: relative; margin-bottom: 16px; }
    .profile-avatar {
      width: 120px; height: 120px; border-radius: 50%; object-fit: cover;
      border: 4px solid white; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }

    .role-badge {
      position: absolute; bottom: 2px; right: 2px; background: #0ea5e9; color: white;
      width: 36px; height: 36px; border-radius: 50%; border: 3px solid white;
      display: flex; align-items: center; justify-content: center;
    }

    .profile-name { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 4px; }
    
    .member-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #f0f9ff;
      border: 1px solid #e0f2fe;
      border-radius: 100px;
      color: #0ea5e9;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 20px;
    }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%; margin-bottom: 32px; }
    .stat-pill {
      background: white; padding: 24px 12px; border-radius: 24px;
      display: flex; flex-direction: column; align-items: center;
      border: 1px solid #f1f5f9; transition: 0.3s ease;
    }
    .stat-pill:hover { border-color: #e2e8f0; transform: translateY(-4px); }

    .icon-box { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .bg-blue { background: #f0f9ff; color: #0ea5e9; }
    .bg-amber { background: #fffbeb; color: #f59e0b; }
    .bg-emerald { background: #ecfdf5; color: #10b981; }

    .stat-value { font-size: 22px; font-weight: 800; color: #0f172a; }
    .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

    .action-group { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .pill-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 100px;
      font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: 0.2s;
    }
    .btn-main { background: #0f172a; color: white; }
    .btn-outline { background: white; border: 1.5px solid #e2e8f0; color: #475569; }

    .section-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
    .section-subtitle { font-size: 13px; color: #94a3b8; font-weight: 500; margin-bottom: 20px; }

    .info-item {
      display: flex; align-items: center; gap: 16px; padding: 14px 18px;
      background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; margin-bottom: 12px;
    }
    .info-icon-circle { color: #64748b; }
    .info-content .label { font-size: 11px; font-weight: 700; color: #94a3b8; margin: 0; text-transform: uppercase; }
    .info-content .value { font-size: 14px; font-weight: 600; color: #334155; margin: 0; }

    .bio-highlight {
      background: #f8fafc; padding: 20px; border-radius: 20px; 
      color: #475569; font-size: 14px; font-weight: 500; line-height: 1.6;
      border: 1px solid #e2e8f0;
    }

    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: 1fr; }
      .header-top { justify-content: center; flex-direction: column; gap: 10px; }
      .page-label { display: block; font-size: 20px; }
    }
  `;

  if (loading) return (
    <div className="profile-page">
      <style>{styles}</style>
      <Loader2 className="animate-spin text-sky-500" size={40} style={{marginTop: '150px'}} />
    </div>
  );

  return (
    <div className="profile-page">
      <style>{styles}</style>
      
      <div className="profile-container">
        {/* HEADER TOP AREA */}
        <div className="header-top">
          <div className="page-title-group">
            <button onClick={() => navigate('/levels')} className="btn-back-profile" title="Kembali">
              <ArrowLeft size={28} /> 
            </button>
            <h2 className="page-label">My Profile</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
             <Sparkles size={14} color="#f59e0b" /> SAKA PERSONAL DASHBOARD
          </div>
        </div>

        {/* HERO CARD */}
        <div className="profile-card-main profile-hero">
          <div className="avatar-wrapper">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
              className="profile-avatar"
              alt="Profile"
            />
            <div className="role-badge">
              {user.role === 'admin' ? <Shield size={18} /> : <Star size={18} />}
            </div>
          </div>
          <h1 className="profile-name">{user.fullName || user.username}</h1>
          
          <div className="member-badge">
            <Award size={14} /> Member of SAKA Path
          </div>

          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '24px', maxWidth: '450px' }}>
            Lihat progres belajar dan atur akun kamu di sini. Terus belajar untuk hasil terbaik!
          </p>
          
          <div className="action-group">
            <button className="pill-btn btn-main" onClick={() => setActiveModal('edit')}>
              <Edit3 size={16} /> Edit Profile
            </button>
            <button className="pill-btn btn-outline" onClick={() => setActiveModal('password')}>
              <Lock size={16} /> Password
            </button>
            <button className="pill-btn btn-outline" onClick={() => setActiveModal('settings')}>
              <Settings size={16} /> Settings
            </button>
          </div>
        </div>

        {/* STATS SECTION */}
        {user.role === 'student' && (
          <div className="stats-row">
            <div className="stat-pill">
              <div className="icon-box bg-blue">
                <BookOpen size={24} />
              </div>
              <div className="stat-value">{user.totallevelsCompleted || 0}</div>
              <div className="stat-label">Levels Done</div>
            </div>

            <div className="stat-pill">
              <div className="icon-box bg-amber">
                <Zap size={24} />
              </div>
              <div className="stat-value">{user.totalXP || 0}</div>
              <div className="stat-label">Total XP</div>
            </div>

            <div className="stat-pill">
              <div className="icon-box bg-emerald">
                <Trophy size={24} />
              </div>
              <div className="stat-value">{user.averageScore || 0}%</div>
              <div className="stat-label">Avg. Accuracy</div>
            </div>
          </div>
        )}

        {/* DETAILS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div className="profile-card-main">
            <h3 className="section-title"><UserIcon size={18} className="info-icon-circle" /> Account Details</h3>
            <p className="section-subtitle">Data akun pribadimu di SAKA.</p>
            <div className="info-list">
              <div className="info-item">
                <Mail size={18} className="info-icon-circle" />
                <div className="info-content">
                  <p className="label">Registered Email</p>
                  <p className="value">{user.email || 'Not set'}</p>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={18} className="info-icon-circle" />
                <div className="info-content">
                  <p className="label">Joined Since</p>
                  <p className="value">{new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card-main">
            <h3 className="section-title"><Award size={18} className="info-icon-circle" /> About Me</h3>
            <p className="section-subtitle">Bio singkat mengenai belajarmu.</p>
            {user.bio ? (
              <div className="bio-highlight">
                "{user.bio}"
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '10px' }}>Belum menambahkan bio.</p>
            )}
            
            <div style={{ marginTop: '20px' }}>
              <ExportButton exportType={user.role === 'admin' ? 'users-csv' : 'progress-csv'} variant="default" />
            </div>
          </div>

        </div>
      </div>

      {activeModal === 'edit' && <ProfileEditModal user={user} onClose={() => setActiveModal(null)} onUpdate={handleProfileUpdate} />}
      {activeModal === 'password' && <PasswordChangeModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'settings' && <UserSettingsModal user={user} onClose={() => setActiveModal(null)} onUpdate={handleProfileUpdate} />}
    </div>
  );
}