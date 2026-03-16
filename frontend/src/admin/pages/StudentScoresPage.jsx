import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function StudentScoresPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const { userId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentScores();
  }, [userId]);

  const fetchStudentScores = async () => {
    try {
      const response = await adminAPI.getUserProgress(userId);
      setStudentData(response.data);
    } catch (err) {
      console.error('Failed to fetch student scores:', err);
      const errorMessage = 'Failed to load student scores';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!studentData || !studentData.levelProgress) return { avgScore: 0, completedLevels: 0, totalLevels: 0 };
    
    const levels = studentData.levelProgress;
    const completedLevels = levels.filter(level => level.status === 'completed').length;
    const totalLevels = levels.length;
    
    const scoresWithValue = levels.filter(level => level.highScore > 0);
    const avgScore = scoresWithValue.length > 0
      ? Math.round(scoresWithValue.reduce((sum, level) => sum + level.highScore, 0) / scoresWithValue.length)
      : 0;

    return { avgScore, completedLevels, totalLevels };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: '#dcfce7', color: '#166534', text: '✅ Completed' },
      unlocked: { bg: '#dbeafe', color: '#1e40af', text: '🔓 In Progress' },
      locked: { bg: '#f3f4f6', color: '#6b7280', text: '🔒 Locked' }
    };

    const config = statusConfig[status] || statusConfig.locked;
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        background: config.bg,
        color: config.color,
      }}>
        {config.text}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Orange
    if (score > 0) return '#ef4444';   // Red
    return '#9ca3af';                  // Gray for no attempts
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => navigate('/admin/users')}
          className="btn btn-secondary"
          style={{ marginBottom: '20px' }}
        >
          ← Back to Users
        </button>
        <div className="alert alert-error">
          {error || 'Student data not found'}
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/admin/users')}
          className="btn btn-secondary"
          style={{ marginBottom: '16px' }}
        >
          ← Back to Users
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
          Student Performance Report
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>
          {studentData.user?.username || 'Student'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>⭐</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
            {stats.avgScore}%
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
            Average Score
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
            {stats.completedLevels}/{stats.totalLevels}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
            Completed Levels
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
            {stats.totalLevels > 0 ? Math.round((stats.completedLevels / stats.totalLevels) * 100) : 0}%
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
            Progress Rate
          </div>
        </div>
      </div>

      {/* Scores Table */}
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
          Level-by-Level Performance
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Level</th>
                <th>Status</th>
                <th>High Score</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {studentData.levelProgress && studentData.levelProgress.map((level) => (
                <tr key={level.levelNumber}>
                  <td style={{ fontWeight: '600' }}>
                    Level {level.levelNumber}
                  </td>
                  <td>
                    {getStatusBadge(level.status)}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: getScoreColor(level.highScore)
                    }}>
                      {level.highScore}%
                    </span>
                  </td>
                  <td>
                    <div style={{ width: '100%', maxWidth: '200px' }}>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${level.highScore}%`,
                          height: '100%',
                          background: getScoreColor(level.highScore),
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Info */}
      {studentData.updatedAt && (
        <div style={{ marginTop: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
          Last updated: {new Date(studentData.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}