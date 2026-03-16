import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userAPI } from '../../services/api';
import '../../styles/Modal.css';

function UserSettingsModal({ user, onClose, onUpdate }) {
  const [preferences, setPreferences] = useState(user.preferences || {
    language: 'id',
    theme: 'light',
    notificationsEnabled: true,
    emailNotifications: true,
    soundEnabled: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.updatePreferences(preferences);
      toast.success('Preferences saved successfully!');
      
      // Update user with new preferences
      onUpdate({
        ...user,
        preferences: response.data.preferences || preferences,
      });
    } catch (error) {
      toast.error(error.message || 'Error updating preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings & Preferences</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Display Settings */}
          <div className="settings-section">
            <h3>Display Settings</h3>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h3>Notification Settings</h3>

            <div className="toggle-group">
              <div className="toggle-item">
                <div className="toggle-label">
                  <span>In-App Notifications</span>
                  <small>Receive notifications in the app</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notificationsEnabled}
                    onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-label">
                  <span>Email Notifications</span>
                  <small>Receive email notifications</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    disabled={!preferences.notificationsEnabled}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-label">
                  <span>Sound Effects</span>
                  <small>Enable sound effects and alerts</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.soundEnabled}
                    onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-info">
              <p className="info-text">
                💡 You will receive notifications for:
              </p>
              <ul className="notification-types">
                <li>Achievement unlocked</li>
                <li>Level completed</li>
                <li>Score milestones</li>
                <li>Leaderboard changes</li>
                <li>Course announcements</li>
              </ul>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="settings-section">
            <h3>Privacy</h3>
            <div className="privacy-info">
              <p>Your profile and achievements are visible to other students on the leaderboard.</p>
              <p>You can control your account settings and data in your profile.</p>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserSettingsModal;
