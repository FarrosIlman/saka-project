import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';
import api from '../../services/api';
import './StreakTracker.css';

const StreakTracker = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakInfo();
  }, []);

  const fetchStreakInfo = async () => {
    try {
      const response = await api.get('/gamification/streak');
      setStreakData(response.data);
    } catch (error) {
      console.error('Failed to fetch streak info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="streak-tracker loading">Loading streak data...</div>;
  }

  if (!streakData) {
    return <div className="streak-tracker">No streak data available</div>;
  }

  const currentStreak = streakData.currentStreak || 0;
  const longestStreak = streakData.longestStreak || 0;
  const lastActivityDate = streakData.lastActivityDate ? new Date(streakData.lastActivityDate) : null;

  const daysUntilExpire = lastActivityDate
    ? Math.ceil((lastActivityDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) + 1
    : 0;

  return (
    <div className="streak-tracker">
      <div className="streak-container">
        <div className="streak-card current">
          <div className="streak-icon">
            <Flame size={32} />
          </div>
          <div className="streak-info">
            <p className="streak-label">Current Streak</p>
            <h3 className="streak-number">{currentStreak}</h3>
            <p className="streak-subtext">days in a row</p>
            {daysUntilExpire > 0 && (
              <p className="streak-warning">
                {daysUntilExpire} day{daysUntilExpire > 1 ? 's' : ''} to maintain
              </p>
            )}
          </div>
        </div>

        <div className="streak-card best">
          <div className="streak-icon">
            <Trophy size={32} />
          </div>
          <div className="streak-info">
            <p className="streak-label">Best Streak</p>
            <h3 className="streak-number">{longestStreak}</h3>
            <p className="streak-subtext">personal record</p>
          </div>
        </div>
      </div>

      <div className="streak-progress">
        <div className="progress-header">
          <Calendar size={16} />
          <p>Keep up your streak!</p>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min((currentStreak / Math.max(longestStreak, 10)) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
        <p className="progress-text">
          {currentStreak} days - {Math.max(longestStreak, 10) - currentStreak} more to match your record
        </p>
      </div>
    </div>
  );
};

export default StreakTracker;
