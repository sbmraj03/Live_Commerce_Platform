const mongoose = require('mongoose');

// One-off reactions sent by viewers during a session
const reactionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: [true, 'Session ID is required']
    },
    type: {
      type: String,
      required: [true, 'Reaction type is required'],
      enum: ['like', 'love', 'fire', 'clap', 'wow', 'laugh', 'best', 'disagree', 'angry', 'cry' ]
    },
    userId: {
      type: String, // For now, we'll use socket ID or a simple identifier
      required: [true, 'User ID is required']
    },
    userName: {
      type: String,
      default: 'Anonymous'
    }
  },
  {
    // createdAt lets us fetch recent reactions quickly
    timestamps: true
  }
);

// Optimize lookups by session and reaction type
reactionSchema.index({ sessionId: 1, createdAt: -1 });
reactionSchema.index({ sessionId: 1, type: 1 });

module.exports = mongoose.model('Reaction', reactionSchema);