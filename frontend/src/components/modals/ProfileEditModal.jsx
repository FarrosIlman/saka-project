import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userAPI } from '../../services/api';
import '../../styles/Modal.css';

function ProfileEditModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          avatar: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      onUpdate(response.data.user || response.data);
    } catch (error) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Avatar Section */}
          <div className="form-section">
            <label>Profile Picture</label>
            <div className="avatar-upload-area">
              <img 
                src={formData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                alt="Avatar preview" 
                className="avatar-preview"
              />
              <label className="avatar-input-label">
                <Upload size={20} />
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>
            </div>
            <small>Used dicebear API for avatar generation. You can use any image URL.</small>
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
              maxLength="500"
            />
            <small>{formData.bio.length}/500</small>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEditModal;
