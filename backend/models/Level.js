const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema(
  {
    levelNumber: {
      type: Number,
      required: [true, 'Level number is required'],
      unique: true,
      min: [1, 'Level number must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'Level title is required'],
      trim: true,
    },
    theme: {
      type: String,
      required: [true, 'Level theme is required'],
      trim: true,
    },
    phase: {
      type: Number,
      required: [true, 'Level phase is required'],
      min: [1, 'Phase must be at least 1'],
      default: 1,
    },
    materialText: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Level image URL is required'],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Level', levelSchema);