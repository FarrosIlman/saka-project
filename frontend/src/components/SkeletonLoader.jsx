import React from 'react';

export const SkeletonLoader = ({ count = 1, height = '20px', width = '100%', style = {} }) => {
  const styles = `
    .skeleton {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height,
            width,
            ...style,
            marginBottom: i === count - 1 ? '0' : '12px'
          }}
        />
      ))}
    </>
  );
};

export const SkeletonCard = ({ count = 3 }) => {
  const styles = `
    .skeleton-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
    }

    .skeleton {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .skeleton-header {
      height: 24px;
      width: 30%;
      margin-bottom: 20px;
    }

    .skeleton-line {
      height: 16px;
      margin-bottom: 12px;
    }

    .skeleton-line:last-child {
      margin-bottom: 0;
    }

    .skeleton-line.short {
      width: 60%;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-header" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </>
  );
};

export const SkeletonGrid = ({ columns = 3, count = 6 }) => {
  const styles = `
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    @media (max-width: 480px) {
      .skeleton-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    @media (max-width: 600px) {
      .skeleton-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }
    }

    .skeleton-item {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .skeleton-image {
      height: 160px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    .skeleton-content {
      padding: 16px;
    }

    .skeleton {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 6px;
      margin-bottom: 12px;
    }

    .skeleton-title {
      height: 18px;
      width: 70%;
      margin-bottom: 8px;
    }

    .skeleton-text {
      height: 14px;
      width: 100%;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="skeleton-grid">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-item">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SkeletonLoader;
