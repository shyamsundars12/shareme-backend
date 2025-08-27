const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = process.env.FILE_UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload PDF file
router.post('/upload-pdf', auth, upload.single('pdf'), [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const { title, description } = req.body;

    // Create new note
    const note = new Note({
      uploaderId: req.user._id,
      title,
      description,
      type: 'pdf',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        note
      }
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    
    // Clean up uploaded file if note creation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during PDF upload'
    });
  }
});

// Share external link
router.post('/share-link', auth, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('linkUrl').isURL().withMessage('Please provide a valid URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, linkUrl } = req.body;

    // Create new note
    const note = new Note({
      uploaderId: req.user._id,
      title,
      description,
      type: 'link',
      linkUrl
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Link shared successfully',
      data: {
        note
      }
    });

  } catch (error) {
    console.error('Link sharing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during link sharing'
    });
  }
});

// Get all notes (PDFs and links)
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('uploaderId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        notes
      }
    });

  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes'
    });
  }
});

// Get notes by type (pdf or link)
router.get('/type/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['pdf', 'link'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note type. Must be "pdf" or "link"'
      });
    }

    const notes = await Note.find({ type })
      .populate('uploaderId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        notes
      }
    });

  } catch (error) {
    console.error('Fetch notes by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes by type'
    });
  }
});

// Get user's own notes
router.get('/my-notes', auth, async (req, res) => {
  try {
    const notes = await Note.find({ uploaderId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        notes
      }
    });

  } catch (error) {
    console.error('Fetch user notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user notes'
    });
  }
});

// Delete note (only by uploader)
router.delete('/:noteId', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user is the uploader
    if (note.uploaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }

    // Delete file if it's a PDF
    if (note.type === 'pdf' && note.fileUrl) {
      const filePath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Note.findByIdAndDelete(req.params.noteId);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting note'
    });
  }
});

module.exports = router;
