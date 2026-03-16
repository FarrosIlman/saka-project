import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function UserEditPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(userId);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await adminAPI.getUsers({ search: '' });
      const user = response.data.users.find((u) => u._id === userId);
      if (user) {
        setFormData({
          username: user.username,
          password: '',
          role: user.role,
        });
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditMode) {
        await adminAPI.updateUser(userId, formData);
        showToast.success(`User "${formData.username}" updated successfully`);
      } else {
        await adminAPI.createUser(formData);
        showToast.success(`User "${formData.username}" created successfully`);
      }
      navigate('/admin/users');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save user';
      setError(errorMessage);
      showToast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px', color: '#111827' }}>
          {isEditMode ? 'Edit User' : 'Create New User'}
        </h1>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Password {isEditMode && '(leave blank to keep current)'}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!isEditMode}
              placeholder={isEditMode ? 'Leave blank to keep current' : ''}
            />
          </div>

          <div className="input-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Update User' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}