import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, Zap, Users } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './AdvancedReporting.css';

const AdvancedReporting = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30days');
  const [sortBy, setSortBy] = useState('totalXp');
  const { success, error } = useToast();

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reporting/analytics/advanced');
      setAnalytics(response.data);
      success('Advanced analytics loaded');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportUserCSV = async () => {
    try {
      const response = await api.get('/reporting/export/users/csv', {
        responseType: 'blob',
      });
      downloadCSV(response.data, 'users_report.csv');
      success('User report exported successfully');
    } catch (err) {
      error('Failed to export user report');
    }
  };

  const handleExportProgressCSV = async () => {
    try {
      const response = await api.get('/reporting/export/progress/csv', {
        responseType: 'blob',
      });
      downloadCSV(response.data, 'progress_report.csv');
      success('Progress report exported successfully');
    } catch (err) {
      error('Failed to export progress report');
    }
  };

  const downloadCSV = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="reporting-loader">Loading analytics...</div>;
  }

  return (
    <div className="advanced-reporting">
      <div className="reporting-header">
        <h1>📊 Advanced Analytics & Reporting</h1>
        <p>Comprehensive insights and data export tools</p>
      </div>

      {/* Tabs */}
      <div className="reporting-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'byLevel' ? 'active' : ''}`}
          onClick={() => setActiveTab('byLevel')}
        >
          By Level
        </button>
        <button
          className={`tab-btn ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          User Engagement
        </button>
        <button
          className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Export Data
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="reporting-section">
          <div className="stats-grid">
            <div className="stat-card">
              <Users size={32} />
              <div>
                <p className="stat-label">Total Students</p>
                <p className="stat-value">{analytics.summary.totalUsers}</p>
              </div>
            </div>
            <div className="stat-card">
              <Zap size={32} />
              <div>
                <p className="stat-label">Active This Week</p>
                <p className="stat-value">{analytics.summary.activeUsers}</p>
              </div>
            </div>
            <div className="stat-card">
              <Calendar size={32} />
              <div>
                <p className="stat-label">Completion Rate</p>
                <p className="stat-value">{analytics.summary.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Badge Distribution */}
          {analytics.badgeStats && (
            <div className="section-card">
              <h2>Badge Distribution</h2>
              <div className="badge-grid">
                {analytics.badgeStats.map((badge, idx) => (
                  <div key={idx} className="badge-stat">
                    <p className="badge-type">{badge._id}</p>
                    <p className="badge-count">{badge.count} total</p>
                    <p className="badge-unlocked">{badge.unlocked} unlocked</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* By Level Tab */}
      {activeTab === 'byLevel' && analytics && (
        <div className="reporting-section">
          <div className="section-card">
            <h2>Performance by Level</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Completions</th>
                  <th>Avg Score</th>
                  <th>Total XP</th>
                </tr>
              </thead>
              <tbody>
                {analytics.byLevel.map((level, idx) => (
                  <tr key={idx}>
                    <td>Level {level._id}</td>
                    <td>{level.count}</td>
                    <td>{level.avgScore.toFixed(1)}%</td>
                    <td>{level.totalXP}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && analytics && (
        <div className="reporting-section">
          <div className="section-card">
            <h2>Top Engaged Students</h2>
            <table className="data-table engagement-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Total XP</th>
                  <th>Levels</th>
                  <th>Completion %</th>
                  <th>Current Streak</th>
                </tr>
              </thead>
              <tbody>
                {analytics.userEngagement.slice(0, 20).map((user, idx) => (
                  <tr key={idx}>
                    <td>{user.username}</td>
                    <td>{user.totalXp || 0}</td>
                    <td>{user.progressCount}</td>
                    <td>{(user.completionRate * 100).toFixed(1)}%</td>
                    <td>{user.currentStreak || 0} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="reporting-section">
          <div className="export-grid">
            <div className="export-card">
              <Download size={48} />
              <h3>User Report</h3>
              <p>Export all student information including XP, streaks, and progress</p>
              <button
                className="export-btn primary"
                onClick={handleExportUserCSV}
              >
                Export CSV
              </button>
            </div>

            <div className="export-card">
              <Download size={48} />
              <h3>Progress Report</h3>
              <p>Export detailed level completion, scores, and attempts data</p>
              <button
                className="export-btn primary"
                onClick={handleExportProgressCSV}
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="section-card">
            <h2>Advanced Filters</h2>
            <div className="filter-group">
              <label>Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="alltime">All Time</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="totalXp">Total XP</option>
                <option value="xpGainedRecently">Recent XP</option>
                <option value="completionRate">Completion Rate</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReporting;
