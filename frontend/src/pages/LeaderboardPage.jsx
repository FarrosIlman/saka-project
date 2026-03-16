import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Trophy, TrendingUp, Award, Loader2 } from 'lucide-react';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { error } = useToast();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await progressAPI.getLeaderboard(limit);
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      error('Gagal memuat papan peringkat. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const styles = `
    .leaderboard-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .leaderboard-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .leaderboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .back-button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .title {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .limit-selector {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 15px;
      border-radius: 20px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .limit-selector:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .leaderboard-table {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .table-header {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      display: grid;
      grid-template-columns: 80px 1fr 120px 120px 120px;
      gap: 15px;
      padding: 20px;
      font-weight: 600;
      font-size: 14px;
    }

    .table-body {
      max-height: 600px;
      overflow-y: auto;
    }

    .table-row {
      display: grid;
      grid-template-columns: 80px 1fr 120px 120px 120px;
      gap: 15px;
      padding: 18px 20px;
      border-bottom: 1px solid #f0f0f0;
      align-items: center;
      transition: background 0.3s ease;
    }

    .table-row:hover {
      background: #f8f9ff;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .rank-cell {
      font-size: 22px;
      font-weight: 700;
      text-align: center;
    }

    .rank-cell.top3 {
      font-size: 28px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    .username-cell {
      font-weight: 600;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .stat-cell {
      text-align: center;
      color: #666;
      font-size: 14px;
    }

    .stat-value {
      font-weight: 700;
      color: #0ea5e9;
      font-size: 16px;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: white;
      gap: 10px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    @media (max-width: 768px) {
      .title {
        font-size: 22px;
      }

      .table-header {
        font-size: 12px;
        padding: 15px;
        grid-template-columns: 60px 1fr 100px 100px 100px;
        gap: 10px;
      }

      .table-row {
        grid-template-columns: 60px 1fr 100px 100px 100px;
        gap: 10px;
        padding: 12px 15px;
      }

      .rank-cell {
        font-size: 18px;
      }

      .rank-cell.top3 {
        font-size: 22px;
      }

      .stat-value {
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      .leaderboard-page {
        padding: 10px;
      }

      .leaderboard-header {
        margin-bottom: 20px;
      }

      .title {
        font-size: 18px;
      }

      .limit-selector {
        padding: 6px 12px;
        font-size: 12px;
      }

      .table-header {
        font-size: 11px;
        padding: 12px 10px;
        grid-template-columns: 50px 1fr 85px 85px 85px;
        gap: 8px;
      }

      .table-row {
        grid-template-columns: 50px 1fr 85px 85px 85px;
        gap: 8px;
        padding: 10px;
        font-size: 13px;
      }

      .rank-cell {
        font-size: 16px;
      }

      .stat-value {
        font-size: 13px;
      }
    }
  `;

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <div className="header-left">
              <button
                className="back-button"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="title">
                <Trophy size={32} />
                Papan Peringkat
              </h1>
            </div>
          </div>
          <div className="leaderboard-table">
            <div className="loading">
              <Loader2 size={24} className="animate-spin" />
              <span>Memuat papan peringkat...</span>
            </div>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <div className="header-left">
            <button
              className="back-button"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="title">
              <Trophy size={32} />
              Papan Peringkat
            </h1>
          </div>
          <select
            className="limit-selector"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>

        {leaderboard.length > 0 ? (
          <div className="leaderboard-table">
            <div className="table-header">
              <div>Peringkat</div>
              <div>Siswa</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <Award size={14} />
                Level
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <TrendingUp size={14} />
                Rata-rata
              </div>
              <div>Total Nilai</div>
            </div>
            <div className="table-body">
              {leaderboard.map((user) => (
                <div key={user._id} className="table-row">
                  <div className={`rank-cell ${user.rank <= 3 ? 'top3' : ''}`}>
                    {getRankMedal(user.rank)}
                  </div>
                  <div className="username-cell">{user.user.username}</div>
                  <div className="stat-cell">
                    <div className="stat-value">{user.completedLevels}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>dituntaskan</div>
                  </div>
                  <div className="stat-cell">
                    <div className="stat-value">{user.avgScore.toFixed(1)}%</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>rata-rata</div>
                  </div>
                  <div className="stat-cell">
                    <div className="stat-value">{user.totalScore}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>poin</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="empty-state">
              <p>Belum ada data papan peringkat. Mulai bermain untuk muncul di peringkat!</p>
            </div>
          </div>
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
}
