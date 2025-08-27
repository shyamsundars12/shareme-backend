const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

const app = require('../app');
const { connectToDatabase } = require('../db');

let dbReady = null;

module.exports = async (req, res) => {
  try {
    if (!dbReady) {
      dbReady = connectToDatabase(process.env.MONGODB_URI);
    }
    await dbReady;
    return app(req, res);
  } catch (err) {
    console.error('API handler error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};


