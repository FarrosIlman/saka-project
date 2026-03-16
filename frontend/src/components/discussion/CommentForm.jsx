import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './CommentForm.css';

const CommentForm = ({ levelId, onCommentAdded, onCancel }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/comments', {
        levelId,
        content: content.trim(),
        rating: rating || null
      });

      if (response.data.success) {
        toast.success('Comment posted successfully!');
        onCommentAdded(response.data.comment);
        setContent('');
        setRating(0);
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Your comment</label>
        <textarea
          className="form-textarea"
          placeholder="Share your thoughts, tips, or ask questions..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={4}
          disabled={loading}
        ></textarea>
        <div className="char-count">
          {content.length}/1000
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Rate this level</label>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-button ${
                (hoveredRating || rating) >= star ? 'active' : ''
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={loading}
            >
              <Star size={20} />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="rating-text">
            You rated this level: <strong>{rating}/5</strong>
          </p>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="submit-button"
          disabled={loading || !content.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Posting...
            </>
          ) : (
            <>
              <Send size={16} />
              Post Comment
            </>
          )}
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
