import React, { useState, useEffect } from 'react';
import { MessageCircle, Loader } from 'lucide-react';
import CommentForm from './CommentForm';
import CommentCard from './CommentCard';
import api from '../../services/api';
import './CommentSection.css';

const CommentSection = ({ levelId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (levelId) {
      fetchComments();
    }
  }, [levelId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/comments/level/${levelId}`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments]);
    setShowForm(false);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId));
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(comments.map(c => c._id === updatedComment._id ? updatedComment : c));
  };

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h3 className="comment-title">
          <MessageCircle size={20} />
          Discussion ({comments.length})
        </h3>
        <button
          className="comment-toggle-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Leave a comment'}
        </button>
      </div>

      {showForm && (
        <CommentForm
          levelId={levelId}
          onCommentAdded={handleCommentAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="comments-list">
        {loading ? (
          <div className="loading-state">
            <Loader className="spinner" size={24} />
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={32} />
            <p>No comments yet. Be the first to share!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onDelete={handleCommentDeleted}
              onUpdate={handleCommentUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
