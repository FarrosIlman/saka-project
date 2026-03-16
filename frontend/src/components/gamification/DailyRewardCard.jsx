import React, { useState, useEffect } from 'react';
import { Gift, Check, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './DailyRewardCard.css';

const DailyRewardCard = () => {
  const [canClaim, setCanClaim] = useState(true);
  const [lastClaimed, setLastClaimed] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkRewardStatus();
  }, []);

  const checkRewardStatus = () => {
    const lastClaimedTime = localStorage.getItem('lastDailyRewardClaimed');
    if (lastClaimedTime) {
      const lastClaimedDate = new Date(lastClaimedTime);
      const today = new Date();
      
      if (lastClaimedDate.toDateString() === today.toDateString()) {
        setCanClaim(false);
        setLastClaimed(lastClaimedDate);
      }
    }
  };

  const handleClaimReward = async () => {
    setLoading(true);
    try {
      const response = await api.post('/gamification/claim-daily-reward');
      
      if (response.data.success) {
        const { pointsEarned, xpGained } = response.data;
        
        localStorage.setItem('lastDailyRewardClaimed', new Date().toISOString());
        setCanClaim(false);
        setLastClaimed(new Date());
        
        toast.success(`🎉 Claimed! +${pointsEarned} points +${xpGained} XP`, {
          duration: 3000,
          icon: '🎁'
        });
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      toast.error('Already claimed today or network error');
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilReset = () => {
    if (!lastClaimed) return null;
    
    const tomorrow = new Date(lastClaimed);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const now = new Date();
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="daily-reward-card">
      <div className="reward-content">
        <div className="reward-icon">
          {canClaim ? <Gift size={40} /> : <Check size={40} />}
        </div>
        
        <div className="reward-info">
          <h3 className="reward-title">Daily Reward</h3>
          <p className="reward-description">
            {canClaim 
              ? 'Claim your daily bonus!' 
              : 'Come back tomorrow for another reward'}
          </p>
          
          {canClaim ? (
            <div className="reward-items">
              <span className="reward-item">+10 <strong>Points</strong></span>
              <span className="reward-separator">•</span>
              <span className="reward-item">+25 <strong>XP</strong></span>
            </div>
          ) : (
            <div className="reward-next">
              <Clock size={14} />
              <span>Next claim: {getTimeUntilReset()}</span>
            </div>
          )}
        </div>
      </div>
      
      <button
        className={`reward-button ${!canClaim ? 'disabled' : ''}`}
        onClick={handleClaimReward}
        disabled={!canClaim || loading}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Claiming...
          </>
        ) : canClaim ? (
          <>
            <Gift size={18} />
            Claim Now
          </>
        ) : (
          <>
            <Check size={18} />
            Claimed Today
          </>
        )}
      </button>
    </div>
  );
};

export default DailyRewardCard;
