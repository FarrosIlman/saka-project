const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { isValidObjectId } = require('mongoose');
const { containsProfanity, getDetectedBadWords } = require('../utils/profanityFilter');

const Level = require('../models/Level');
const User = require('../models/User');

// Get comments for a level
exports.getLevelComments = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // Check if levelId is a number
    const levelNum = parseInt(levelId);
    if (isNaN(levelNum)) {
      return res.status(400).json({ message: 'Invalid level ID format' });
    }
    
    // Find the level ObjectId by levelNumber
    const levelDoc = await Level.findOne({ levelNumber: levelNum });
    if (!levelDoc) {
      return res.status(404).json({ message: 'Level not found' });
    }
    
    const actualLevelObjectId = levelDoc._id;

    // Validate pagination params
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ message: 'Limit must be between 1 and 100' });
    }
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: 'Page must be a positive number' });
    }

    const comments = await Comment.find({ level: actualLevelObjectId, isApproved: true })
      .populate('author', 'username avatar')
      .populate('replies.author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Comment.countDocuments({ level: actualLevelObjectId, isApproved: true });

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

    // Validate levelId (which is levelNumber from frontend)
    if (!levelId || isNaN(parseInt(levelId))) {
      return res.status(400).json({ message: 'Invalid level ID' });
    }

    // Find the level ObjectId by levelNumber
    const levelDoc = await Level.findOne({ levelNumber: parseInt(levelId) });
    if (!levelDoc) {
      return res.status(404).json({ message: 'Level not found' });
    }
    const actualLevelObjectId = levelDoc._id;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check profanity / bad words
    if (containsProfanity(content)) {
      return res.status(400).json({ 
        message: 'Komentar mengandung kata tidak pantas atau tidak sopan. Harap gunakan bahasa yang baik dan santun.' 
      });
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
    }

    const comment = await Comment.create({
      level: actualLevelObjectId,
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

    // Check profanity / bad words in reply
    if (containsProfanity(content)) {
      return res.status(400).json({ 
        message: 'Balasan mengandung kata tidak pantas atau tidak sopan. Harap gunakan bahasa yang baik dan santun.' 
      });
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

    // Check authorization: author or admin
    const authorId = comment.author ? comment.author.toString() : '';
    const userId = (req.user._id || req.user.id || '').toString();
    const isAdmin = req.user.role === 'admin';

    if (authorId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// Delete reply
exports.deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    if (!isValidObjectId(commentId) || !isValidObjectId(replyId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check authorization: author or admin
    const replyAuthorId = reply.author ? reply.author.toString() : '';
    const userId = (req.user._id || req.user.id || '').toString();
    const isAdmin = req.user.role === 'admin';

    if (replyAuthorId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    comment.replies.pull(replyId);
    await comment.save();

    res.status(200).json({ success: true, message: 'Reply deleted' });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ message: 'Error deleting reply' });
  }
};

// Get all comments for Admin Moderation
exports.getAllCommentsForAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 15, 
      levelNumber, 
      search = '',
      onlyFlagged = 'false'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 15));

    const query = {};

    // Filter by levelNumber
    if (levelNumber && !isNaN(parseInt(levelNumber))) {
      const levelDoc = await Level.findOne({ levelNumber: parseInt(levelNumber) });
      if (levelDoc) {
        query.level = levelDoc._id;
      } else {
        return res.status(200).json({
          success: true,
          stats: { totalComments: 0, totalReplies: 0, flaggedCount: 0 },
          pagination: { total: 0, page: pageNum, pages: 0, limit: limitNum },
          comments: []
        });
      }
    }

    // Filter by search (content, author username, or reply content)
    if (search && search.trim().length > 0) {
      const trimmedSearch = search.trim();
      const matchingUsers = await User.find({
        username: { $regex: trimmedSearch, $options: 'i' }
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { content: { $regex: trimmedSearch, $options: 'i' } },
        { author: { $in: userIds } },
        { 'replies.content': { $regex: trimmedSearch, $options: 'i' } }
      ];
    }

    const total = await Comment.countDocuments(query);
    const rawComments = await Comment.find(query)
      .populate('author', 'username avatar email role')
      .populate('level', 'levelNumber title')
      .populate('replies.author', 'username avatar role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Compute bad words flag for each comment & reply to help admin spot inappropriate words
    let comments = rawComments.map(doc => {
      const commentObj = doc.toObject();
      const badWordsInContent = getDetectedBadWords(commentObj.content || '');
      const repliesWithFlags = (commentObj.replies || []).map(r => ({
        ...r,
        detectedBadWords: getDetectedBadWords(r.content || '')
      }));

      const hasFlagged = badWordsInContent.length > 0 || repliesWithFlags.some(r => r.detectedBadWords.length > 0);

      return {
        ...commentObj,
        detectedBadWords: badWordsInContent,
        hasFlaggedContent: hasFlagged,
        replies: repliesWithFlags
      };
    });

    if (onlyFlagged === 'true') {
      comments = comments.filter(c => c.hasFlaggedContent);
    }

    // Summary statistics
    const totalAllComments = await Comment.countDocuments();
    const allComments = await Comment.find().select('content replies');
    let totalReplies = 0;
    let flaggedCount = 0;

    allComments.forEach(c => {
      const commentBadWords = getDetectedBadWords(c.content || '');
      const replyBadWords = (c.replies || []).some(r => getDetectedBadWords(r.content || '').length > 0);
      if (commentBadWords.length > 0 || replyBadWords) {
        flaggedCount++;
      }
      totalReplies += (c.replies?.length || 0);
    });

    res.status(200).json({
      success: true,
      stats: {
        totalComments: totalAllComments,
        totalReplies,
        flaggedCount
      },
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      comments
    });
  } catch (error) {
    console.error('Get admin comments error:', error);
    res.status(500).json({ message: 'Error fetching comments for moderation' });
  }
};

// Bulk delete comments (Admin only)
exports.bulkDeleteComments = async (req, res) => {
  try {
    const { commentIds } = req.body;

    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({ message: 'List of comment IDs is required' });
    }

    const validIds = commentIds.filter(id => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ message: 'No valid comment IDs provided' });
    }

    const deleteResult = await Comment.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${deleteResult.deletedCount} komentar berhasil dihapus`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete comments error:', error);
    res.status(500).json({ message: 'Error bulk deleting comments' });
  }
};
