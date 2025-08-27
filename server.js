const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = require('./app');
const { connectToDatabase } = require('./db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDatabase(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Share Me Server running on port ${PORT}`);
      console.log(`📁 Upload directory: ${process.env.FILE_UPLOAD_PATH || './uploads'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});
