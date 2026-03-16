import React from 'react';

export function AchievementBadge({ achievement, isUnlocked = true }) {
  const styles = `
    .achievement-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      background: ${isUnlocked ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : '#f0f0f0'};
      color: ${isUnlocked ? 'white' : '#999'};
      text-align: center;
      transition: all 0.3s ease;
      cursor: default;
      min-width: 100px;
      position: relative;
      overflow: hidden;
    }

    .achievement-badge::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      ${isUnlocked ? 'animation: shimmer 2s infinite;' : ''}
    }

    @keyframes shimmer {
      0%, 100% {
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
    }

    .achievement-badge:hover {
      transform: ${isUnlocked ? 'translateY(-5px)' : 'none'};
      box-shadow: ${isUnlocked ? '0 10px 20px rgba(0, 0, 0, 0.2)' : 'none'};
    }

    .achievement-icon {
      font-size: 32px;
      position: relative;
      z-index: 1;
    }

    .achievement-name {
      font-weight: 700;
      font-size: 13px;
      position: relative;
      z-index: 1;
    }

    .achievement-description {
      font-size: 11px;
      opacity: ${isUnlocked ? '0.9' : '0.7'};
      position: relative;
      z-index: 1;
    }

    .unlock-date {
      font-size: 10px;
      opacity: 0.7;
      position: relative;
      z-index: 1;
      margin-top: 4px;
    }

    .locked-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      background: #e74c3c;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      z-index: 2;
    }

    @media (max-width: 480px) {
      .achievement-badge {
        min-width: 80px;
        padding: 10px;
      }

      .achievement-icon {
        font-size: 24px;
      }

      .achievement-name {
        font-size: 11px;
      }

      .achievement-description {
        font-size: 10px;
      }
    }
  `;

  return (
    <>
      <div className="achievement-badge">
        {!isUnlocked && <div className="locked-badge">🔒</div>}
        <div className="achievement-icon">{achievement.icon || '🏆'}</div>
        <div className="achievement-name">{achievement.name}</div>
        <div className="achievement-description">{achievement.description}</div>
        {isUnlocked && achievement.unlockedAt && (
          <div className="unlock-date">
            {new Date(achievement.unlockedAt).toLocaleDateString('id-ID', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}
      </div>
      <style>{styles}</style>
    </>
  );
}

export default AchievementBadge;
