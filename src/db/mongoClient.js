const { MongoClient } = require('mongodb');

let db;

const connectToDatabase = async () => {
  if (db) return db;

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME);
  console.log('MongoDB connected');
  return db;
};

const getProfilesCollection = async () => {
  const database = await connectToDatabase();
  return database.collection('Profiles');
};

async function getUsersCollection() {
  const db = await connectToDatabase();
  return db.collection('Users');
}

module.exports = {
  connectToDatabase,
  getProfilesCollection,
  getUsersCollection,
};
