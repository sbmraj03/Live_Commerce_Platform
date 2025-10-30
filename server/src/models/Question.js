const mongoose = require('mongoose');

// Stores viewer questions and admin answers per session
const questionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: [true, 'Session ID is required']
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    userId: {
      type: String, // Socket ID or simple identifier
      required: [true, 'User ID is required']
    },
    userName: {
      type: String,
      default: 'Anonymous'
    },
    isAnswered: {
      type: Boolean,
      default: false
    },
    answer: {
      type: String,
      maxlength: [1000, 'Answer cannot exceed 1000 characters']
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  {
    // createdAt used to sort recent questions, updatedAt after answer
    timestamps: true
  }
);

// Speed up reads by session and status
questionSchema.index({ sessionId: 1, createdAt: -1 });
questionSchema.index({ sessionId: 1, isAnswered: 1 });

module.exports = mongoose.model('Question', questionSchema);