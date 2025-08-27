const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Drop all problematic indexes that might exist
    const indexesToDrop = ['userName_1', 'username_1', 'mobile_1', 'phone_1'];
    
    for (const indexName of indexesToDrop) {
      try {
        await usersCollection.dropIndex(indexName);
        console.log(`Successfully dropped ${indexName} index`);
      } catch (error) {
        if (error.code === 27) {
          console.log(`${indexName} index does not exist, skipping...`);
        } else {
          console.error(`Error dropping ${indexName} index:`, error);
        }
      }
    }
    
    // Create the correct index for email field
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('Created email index');
    
    console.log('Database fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
};

fixDatabase();
