const mongoose = require('mongoose');

let cached = global.__mongooseConnection;
if (!cached) {
  cached = global.__mongooseConnection = { conn: null, promise: null };
}

async function connectToDatabase(mongoUri) {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectToDatabase };


