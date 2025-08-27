const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://shareme-tau-one.vercel.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (note: Vercel filesystem is ephemeral; use external storage in production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Share Me API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB for PDFs and 5MB for profile photos.'
      });
    }
  }
  
  if (err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Only image files (JPEG, PNG, GIF) are allowed for profile photos.'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;


