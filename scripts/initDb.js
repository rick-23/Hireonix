require('dotenv').config();
const { MongoClient } = require('mongodb');
const { storeProfile } = require('../src/services/profileService');

async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    // Create database by using it
    const db = client.db(process.env.MONGO_DB_NAME);
    console.log(`Created/Connected to database: ${process.env.MONGO_DB_NAME}`);

    // Create Profiles collection
    await db.createCollection('Profiles');
    console.log('Created Profiles collection');

    // Create an index on email for faster lookups
    await db.collection('Profiles').createIndex({ email: 1 }, { unique: true });
    console.log('Created index on email field');

    // Insert a test profile using storeProfile service
    const testProfileInput = {
      _id: 'cd728ff1d4e30b41921dcb35b1c29ead',
      fileName: 'test_resume.pdf',
      fileContent: `Bane Smith

      Bane.smith@example.com
      
      Experience:
      - Sof at Tech Corp
      - Full Developer at Web Solutions
      
      Education:
      - BSC in Computer Science`,
    };

    const result = await storeProfile(testProfileInput);
    console.log('Test profile stored with result:', result);

    console.log('Database initialization completed successfully!');
    await client.close();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
