import React, { useState, useEffect } from 'react';
import { Trophy, Flame, TrendingUp } from 'lucide-react';
import socketService from '../../services/socketService';
import api from '../../services/api';
import './LiveLeaderboard.css';

const LiveLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [updateAnimation, setUpdateAnimation] = useState(null);

  useEffect(() => {
    fetchInitialLeaderboard();
    setupRealtimeListener();

    return () => {
      socketService.leaveLeaderboard();
    };
  }, []);

  const fetchInitialLeaderboard = async () => {
    try {
      const response = await api.get('/analytics/leaderboard?limit=20');
      setLeaderboard(response.data.leaderboard || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    socketService.joinLeaderboard();
    setIsLive(true);

    socketService.on('leaderboard-updated', (data) => {
      setUpdateAnimation(data.user._id);
      setTimeout(() => setUpdateAnimation(null), 1000);

      setLeaderboard((prev) => {
        const updated = [...prev];
        const userIndex = updated.findIndex((u) => u._id === data.user._id);

        if (userIndex !== -1) {
          updated[userIndex] = data.user;
          // Re-sort
          updated.sort((a, b) => b.totalXP - a.totalXP);
        }

        return updated;
      });
    });
  };

  if (loading) {
    return (
      <div className="live-leaderboard">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-leaderboard">
      <div className="leaderboard-header">
        <div className="header-info">
          <Trophy size={24} />
          <h2>🔴 Live Leaderboard</h2>
          <span className={`live-badge ${isLive ? 'active' : ''}`}>
            {isLive ? '● LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="leaderboard-list">
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>No leaderboard data available</p>
          </div>
        ) : (
          leaderboard.map((user, index) => (
            <div
              key={user._id}
              className={`leaderboard-item ${updateAnimation === user._id ? 'update-animation' : ''}`}
              style={{
                animation: updateAnimation === user._id ? 'pulse-update 0.6s ease' : 'none',
              }}
            >
              <div className="rank">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${index + 1}`}
              </div>

              <div className="user-info">
                <div className="user-avatar-small">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <p className="user-name">{user.username}</p>
                  <div className="user-stats">
                    <span>
                      <TrendingUp size={12} /> {user.completedLevels || 0} levels
                    </span>
                    <span>
                      <Flame size={12} /> {user.currentStreak || 0} day streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="xp-display">
                <div className="xp-number">{user.totalXP || 0}</div>
                <div className="xp-label">XP</div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse-update {
          0% { background: #fff3cd; transform: scale(1); }
          50% { background: #fff9e6; transform: scale(1.02); }
          100% { background: white; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LiveLeaderboard;
