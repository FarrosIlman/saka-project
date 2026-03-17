const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { isValidObjectId } = require('mongoose');

// Get comments for a level
exports.getLevelComments = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // Validate levelId
    if (!isValidObjectId(levelId)) {
      return res.status(400).json({ message: 'Invalid level ID format' });
    }

    // Validate pagination params
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ message: 'Limit must be between 1 and 100' });
    }
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: 'Page must be a positive number' });
    }

    const comments = await Comment.find({ level: levelId, isApproved: true })
      .populate('author', 'username avatar')
      .populate('replies.author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Comment.countDocuments({ level: levelId, isApproved: true });

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      comments,
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Create comment
exports.createComment = async (req, res) => {
  try {
    const { levelId, content, rating } = req.body;

    // Validate levelId
    if (!levelId || !isValidObjectId(levelId)) {
      return res.status(400).json({ message: 'Invalid level ID' });
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
    }

    const comment = await Comment.create({
      level: levelId,
      author: req.user.id,
      content,
      rating: rating || null,
    });

    await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

// Add reply to comment
exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID format' });
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $push: {
          replies: {
            author: req.user.id,
            content,
          },
        },
      },
      { new: true }
    ).populate('author', 'username avatar').populate('replies.author', 'username avatar');

    res.status(200).json({
      success: true,
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Error adding reply' });
  }
};

// Mark helpful
exports.markHelpful = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID format' });
    }

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      helpful: updatedComment.helpful,
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: 'Error updating helpful count' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID format' });
    }

    const comment = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check authorization
    if (comment.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};
