const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// Get comments for a level
exports.getLevelComments = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const comments = await Comment.find({ level: levelId, isApproved: true })
      .populate('author', 'username avatar')
      .populate('replies.author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Comment.countDocuments({ level: levelId, isApproved: true });

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      comments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Create comment
exports.createComment = async (req, res) => {
  try {
    const { levelId, content, rating } = req.body;

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
    res.status(500).json({ message: 'Error creating comment' });
  }
};

// Add reply to comment
exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByIdAndUpdate(
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
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding reply' });
  }
};

// Mark helpful
exports.markHelpful = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      helpful: comment.helpful,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating helpful count' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (comment.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};
