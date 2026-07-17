import React from 'react';
import { Sparkles, Lock } from 'lucide-react';
import './BadgeDisplay.css';

const BadgeDisplay = ({ badges = [] }) => {
  const badgeMetadata = {
    first_blood: { name: 'First Blood', emoji: '🎉', description: 'Complete your first level' },
    speedster: { name: 'Speedster', emoji: '⚡', description: 'Complete a level in under 5 minutes' },
    perfectionist: { name: 'Perfectionist', emoji: '💯', description: 'Score 100% on 5 levels' },
    marathon: { name: 'Marathon', emoji: '🏃', description: 'Complete 10 levels' },
    champion: { name: 'Champion', emoji: '👑', description: 'Reach top 10 leaderboard' },
    legend: { name: 'Legend', emoji: '⭐', description: 'Complete all levels' },
    streak_7: { name: '7-Day Streak', emoji: '🔥', description: 'Complete levels 7 days in a row' },
    streak_30: { name: '30-Day Streak', emoji: '🌟', description: 'Complete levels 30 days in a row' },
    teacher: { name: 'Teacher', emoji: '📚', description: 'Help 5 other students' },
    consistent: { name: 'Consistent', emoji: '📅', description: 'Log in every day for 30 days' },
    night_owl: { name: 'Night Owl', emoji: '🦉', description: 'Complete a level between 10 PM and 4 AM' },
    early_bird: { name: 'Early Bird', emoji: '🌅', description: 'Complete a level between 4 AM and 8 AM' },
    sharpshooter: { name: 'Sharpshooter', emoji: '🎯', description: 'Answer 50 questions without a single mistake' },
    unstoppable: { name: 'Unstoppable', emoji: '🚀', description: 'Complete 3 levels in a single day' },
    scholar: { name: 'Scholar', emoji: '🎓', description: 'Finish all onboarding and tutorials' },
    weekend_warrior: { name: 'Weekend Warrior', emoji: '⚔️', description: 'Complete 5 levels during the weekend' },
    flawless_week: { name: 'Flawless Week', emoji: '✨', description: 'Achieve 100% accuracy for 7 days in a row' },
    polyglot: { name: 'Polyglot', emoji: '🌍', description: 'Master vocabulary from 5 different topics' },
    treasure_hunter: { name: 'Treasure Hunter', emoji: '🏴‍☠️', description: 'Discover your first hidden easter egg' },
    point_hoarder: { name: 'Point Hoarder', emoji: '💰', description: 'Accumulate 5,000 learning points' },
    revival: { name: 'Revival', emoji: '🧟', description: 'Recover your streak using a Streak Freeze' }
  };

  const rarityColors = {
    common: '#808080',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FFD700'
  };

  if (!badges || badges.length === 0) {
    return (
      <div className="badge-display">
        <div className="badge-empty">
          <Sparkles size={32} />
          <p>Unlock badges to display here</p>
        </div>
      </div>
    );
  }

  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const lockedBadges = badges.filter(b => !b.isUnlocked);

  return (
    <div className="badge-display">
      {unlockedBadges.length > 0 && (
        <div className="badge-section">
          <h3 className="badge-section-title">Unlocked Badges</h3>
          <div className="badge-grid">
            {unlockedBadges.map((badge) => {
              const meta = badgeMetadata[badge.badgeType] || {};
              return (
                <div
                  key={badge._id}
                  className="badge-card unlocked"
                  style={{ borderColor: rarityColors[badge.rarity] }}
                  title={meta.description}
                >
                  <div className="badge-emoji" style={{ fontSize: '32px' }}>
                    {meta.emoji}
                  </div>
                  <h4 className="badge-name">{meta.name}</h4>
                  <p className="badge-rarity" style={{ color: rarityColors[badge.rarity] }}>
                    {badge.rarity}
                  </p>
                  <p className="badge-points">+{badge.points} points</p>
                  {badge.unlockedAt && (
                    <p className="badge-date">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {lockedBadges.length > 0 && (
        <div className="badge-section">
          <h3 className="badge-section-title">Locked Badges</h3>
          <div className="badge-grid">
            {lockedBadges.map((badge) => {
              const meta = badgeMetadata[badge.badgeType] || {};
              const progress = badge.progress?.current || 0;
              const target = badge.progress?.target || 1;
              const progressPercent = (progress / target) * 100;

              return (
                <div
                  key={badge._id}
                  className="badge-card locked"
                  style={{ borderColor: rarityColors[badge.rarity] }}
                  title={meta.description}
                >
                  <div className="badge-emoji-locked">
                    <Lock size={16} />
                  </div>
                  <h4 className="badge-name">{meta.name}</h4>
                  <p className="badge-rarity" style={{ color: rarityColors[badge.rarity] }}>
                    {badge.rarity}
                  </p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(progressPercent, 100)}%`,
                        backgroundColor: rarityColors[badge.rarity]
                      }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {progress}/{target}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
