import React, { useState } from 'react';
import { Star, ThumbsUp, Trash2, MessageCircle, User } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './CommentCard.css';

const CommentCard = ({ comment, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [helpful, setHelpful] = useState(comment.helpful || 0);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(
    localStorage.getItem(`helpful_${comment._id}`) === 'true'
  );

  const currentUserId = (user?._id || user?.id || '').toString();
  const commentAuthorId = (comment.author?._id || comment.author?.id || comment.author || '').toString();
  const isAuthor = Boolean(currentUserId && commentAuthorId && currentUserId === commentAuthorId);
  const isAdmin = user?.role === 'admin';
  const canDelete = isAuthor || isAdmin;

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful) return;

    try {
      const response = await api.put(`/comments/${comment._id}/helpful`);
      setHelpful(response.data.helpfulCount);
      setHasMarkedHelpful(true);
      localStorage.setItem(`helpful_${comment._id}`, 'true');
      toast.success('Marked as helpful');
    } catch (error) {
      console.error('Failed to mark helpful:', error);
    }
  };

  const handleAddReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/comments/${comment._id}/reply`, {
        content: replyContent.trim()
      });

      if (response.data.success) {
        onUpdate(response.data.comment);
        setReplyContent('');
        setShowReplyForm(false);
        toast.success('Reply posted!');
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const response = await api.delete(`/comments/${comment._id}`);
      if (response.data.success) {
        onDelete(comment._id);
        toast.success('Comment deleted');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) return;

    try {
      const response = await api.delete(`/comments/${comment._id}/reply/${replyId}`);
      if (response.data.success) {
        const updatedReplies = (comment.replies || []).filter(r => (r._id || r.id) !== replyId);
        onUpdate({ ...comment, replies: updatedReplies });
        toast.success('Reply deleted');
      }
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast.error(error.response?.data?.message || 'Failed to delete reply');
    }
  };

  const authorName = comment.author?.username || 'Anonymous';
  const createdDate = new Date(comment.createdAt).toLocaleDateString();

  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="comment-author">
          <div className="author-avatar">
            <User size={16} />
          </div>
          <div className="author-info">
            <p className="author-name">{authorName}</p>
            <p className="comment-date">{createdDate}</p>
          </div>
        </div>
        
        {canDelete && (
          <button
            className="delete-btn"
            onClick={handleDelete}
            title={isAdmin && !isAuthor ? "Delete comment (Admin)" : "Delete comment"}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="comment-body">
        <p className="comment-text">{comment.content}</p>
        
        {comment.rating && (
          <div className="comment-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < comment.rating ? 'filled' : ''}
              />
            ))}
            <span className="rating-number">{comment.rating}/5</span>
          </div>
        )}
      </div>

      <div className="comment-actions">
        <button
          className={`action-btn ${hasMarkedHelpful ? 'active' : ''}`}
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful}
        >
          <ThumbsUp size={14} />
          Helpful ({helpful})
        </button>
        <button
          className="action-btn"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          <MessageCircle size={14} />
          Reply ({comment.replies?.length || 0})
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-section">
          {comment.replies.map((reply, index) => {
            const replyAuthorId = (reply.author?._id || reply.author?.id || reply.author || '').toString();
            const canDeleteThisReply = isAdmin || (currentUserId && replyAuthorId === currentUserId);

            return (
              <div key={index} className="reply-card">
                <div className="reply-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="reply-author">
                    <div className="author-avatar-small">
                      <User size={12} />
                    </div>
                    <p className="reply-author-name">
                      {reply.author?.username || 'Anonymous'}
                    </p>
                    <p className="reply-date">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {canDeleteThisReply && reply._id && (
                    <button
                      className="delete-btn reply-delete-btn"
                      onClick={() => handleDeleteReply(reply._id)}
                      title={isAdmin && replyAuthorId !== currentUserId ? "Delete reply (Admin)" : "Delete reply"}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="reply-text">{reply.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {showReplyForm && (
        <div className="reply-form">
          <textarea
            className="reply-textarea"
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            disabled={loading}
            rows={2}
          ></textarea>
          <div className="reply-actions">
            <button
              className="reply-submit"
              onClick={handleAddReply}
              disabled={loading || !replyContent.trim()}
            >
              {loading ? 'Posting...' : 'Post Reply'}
            </button>
            <button
              className="reply-cancel"
              onClick={() => setShowReplyForm(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentCard;
