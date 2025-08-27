const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['pdf', 'link'],
    default: 'pdf'
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.type === 'pdf';
    }
  },
  linkUrl: {
    type: String,
    required: function() {
      return this.type === 'link';
    },
    match: [/^https?:\/\/.+/, 'Please provide a valid URL']
  },
  fileName: {
    type: String,
    required: function() {
      return this.type === 'pdf';
    }
  },
  fileSize: {
    type: Number,
    required: function() {
      return this.type === 'pdf';
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
noteSchema.index({ uploaderId: 1, createdAt: -1 });
noteSchema.index({ type: 1 });

module.exports = mongoose.model('Note', noteSchema);
