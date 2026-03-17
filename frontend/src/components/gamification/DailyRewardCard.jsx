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

  const checkRewardStatus = async () => {
    try {
      const response = await api.get('/gamification/daily-reward-status');
      
      if (response.data.success) {
        setCanClaim(response.data.canClaim);
        
        if (response.data.lastClaimedDate) {
          setLastClaimed(new Date(response.data.lastClaimedDate));
        }
      }
    } catch (error) {
      console.error('Failed to check reward status:', error);
      setCanClaim(true);
    }
  };

  const handleClaimReward = async () => {
    // Langsung disable button saat user klik
    setCanClaim(false);
    setLoading(true);
    
    try {
      const response = await api.post('/gamification/claim-daily-reward');
      
      if (response.data.success) {
        const { pointsEarned, xpGained } = response.data;
        setLastClaimed(new Date());
        
        toast.success(`🎉 Claimed! +${pointsEarned} points +${xpGained} XP`, {
          duration: 3000,
          icon: '🎁'
        });
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      
      // Handle specific error responses
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Already claimed today');
        // Keep disabled since already claimed
      } else {
        toast.error('Network error. Try again later.');
        // Re-enable on error so user can try again
        setCanClaim(true);
      }
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
