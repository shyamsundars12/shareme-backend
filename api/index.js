const serverless = require('@vendia/serverless-express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

const app = require('../app');
const { connectToDatabase } = require('../db');

let cachedHandler;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    await connectToDatabase(process.env.MONGODB_URI);
    cachedHandler = serverless({ app });
  }
  return cachedHandler(req, res);
};


