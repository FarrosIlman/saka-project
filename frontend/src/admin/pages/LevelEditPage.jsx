import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { levelAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function LevelEditPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, question: null });

  useEffect(() => {
    fetchLevel();
  }, [levelId]);

  const fetchLevel = async () => {
    try {
      const response = await levelAPI.getAllLevels();
      const foundLevel = response.data.find((l) => l._id === levelId);
      if (foundLevel) {
        setLevel(foundLevel);
        setQuestions(foundLevel.questions);
      }
    } catch (err) {
      console.error('Failed to fetch level:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLevel = async (e) => {
    e.preventDefault();
    try {
      await levelAPI.updateLevel(levelId, level);
      showToast.success(`Level "${level.title}" updated successfully`);
    } catch (err) {
      console.error('Failed to update level:', err);
      showToast.error('Failed to update level');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await levelAPI.createQuestion(levelId, editingQuestion);
      showToast.success('Question created successfully');
      setEditingQuestion(null);
      fetchLevel();
    } catch (err) {
      console.error('Failed to create question:', err);
      showToast.error('Failed to create question');
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await levelAPI.updateQuestion(editingQuestion._id, editingQuestion);
      showToast.success('Question updated successfully');
      setEditingQuestion(null);
      fetchLevel();
    } catch (err) {
      console.error('Failed to update question:', err);
      showToast.error('Failed to update question');
    }
  };

  const handleDeleteQuestion = (question) => {
    setDeleteModal({ isOpen: true, question });
  };

  const confirmDeleteQuestion = async () => {
    try {
      await levelAPI.deleteQuestion(deleteModal.question._id);
      showToast.success('Question deleted successfully');
      setDeleteModal({ isOpen: false, question: null });
      fetchLevel();
    } catch (err) {
      console.error('Failed to delete question:', err);
      showToast.error('Failed to delete question');
      alert('Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!level) {
    return (
      <div style={{ padding: '40px' }}>
        <p>Level not found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px', color: '#111827' }}>
        Edit Level {level.levelNumber}
      </h1>

      {/* Level Details Form */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
          Level Details
        </h2>
        <form onSubmit={handleUpdateLevel}>
          <div className="input-group">
            <label>Title</label>
            <input
              type="text"
              value={level.title}
              onChange={(e) => setLevel({ ...level, title: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Theme</label>
            <input
              type="text"
              value={level.theme}
              onChange={(e) => setLevel({ ...level, theme: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Image URL</label>
            <input
              type="url"
              value={level.imageUrl}
              onChange={(e) => setLevel({ ...level, imageUrl: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Update Level
          </button>
        </form>
      </div>

      {/* Questions Section */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            Questions ({questions.length})
          </h2>
          <button
            onClick={() => setEditingQuestion({
              questionText: '',
              imageUrl: '',
              options: ['', '', ''],
              correctAnswer: '',
            })}
            className="btn btn-primary"
          >
            ➕ Add Question
          </button>
        </div>

        {/* Question List */}
        {questions.map((question, index) => (
          <div
            key={question._id}
            style={{
              padding: '20px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                  Question {index + 1}: {question.questionText}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  <strong>Options:</strong> {question.options.join(', ')}
                </p>
                <p style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                  <strong>Correct Answer:</strong> {question.correctAnswer}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setEditingQuestion(question)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question)}
                  className="btn btn-danger"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Question Form Modal */}
        {editingQuestion && (
          <div className="modal-overlay" onClick={() => setEditingQuestion(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '700px' }}
            >
              <h3 className="modal-header">
                {editingQuestion._id ? 'Edit Question' : 'Add New Question'}
              </h3>
              <form onSubmit={editingQuestion._id ? handleUpdateQuestion : handleCreateQuestion}>
                <div className="input-group">
                  <label>Question Text</label>
                  <textarea
                    value={editingQuestion.questionText}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                    rows="3"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={editingQuestion.imageUrl}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Options (3 options)</label>
                  {editingQuestion.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[index] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      required
                      style={{ marginBottom: '8px' }}
                    />
                  ))}
                </div>

                <div className="input-group">
                  <label>Correct Answer</label>
                  <select
                    value={editingQuestion.correctAnswer}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    required
                  >
                    <option value="">Select correct answer</option>
                    {editingQuestion.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option || `Option ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setEditingQuestion(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingQuestion._id ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <button onClick={() => navigate('/admin/content/levels')} className="btn btn-secondary">
          ← Back to Levels
        </button>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, question: null })}
        onConfirm={confirmDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}