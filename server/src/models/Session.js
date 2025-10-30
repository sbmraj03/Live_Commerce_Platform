const mongoose = require('mongoose');

// Live session metadata and aggregate stats
const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    highlightedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'scheduled'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    hostName: {
      type: String,
      required: [true, 'Host name is required'],
      trim: true
    },
    viewerCount: {
      type: Number,
      default: 0
    },
    peakViewers: {
      type: Number,
      default: 0
    },
    totalReactions: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    }
  },
  {
    // Track creation and updates for analytics
    timestamps: true
  }
);

// Index for faster queries
sessionSchema.index({ status: 1, startTime: -1 });

// Update current viewer count and maintain peak
sessionSchema.methods.updateViewerCount = function(count) {
  this.viewerCount = count;
  if (count > this.peakViewers) {
    this.peakViewers = count;
  }
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);