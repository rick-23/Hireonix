const express = require('express');
const { healthCheck } = require('../utils/healthCheck');
const { connectToDatabase, getProfilesCollection } = require('../db/mongoClient');
const { storeProfile } = require('../services/profileService');
const { userAuth } = require('../middlewares/auth');
const profiles = express.Router();

/* GET home page. */
profiles.get('/', healthCheck);

/* GET all profiles */
profiles.get('/profiles', userAuth, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const profiles = await db.collection('Profiles').find({}).toArray();
    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profiles' });
  }
});

profiles.post('/addProfile', userAuth, async (req, res) => {
  try {
    const db = await connectToDatabase();
    // Create an index on email for faster lookups, Idempotency: characteristic of createIndex is that it's idempotent.
    await db.collection('Profiles').createIndex({ email: 1 }, { unique: true });
    const { fileName, fileContent } = req.body;

    const result = await storeProfile({ fileName, fileContent });

    //Maybe show potential duplicates with matching name
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error Adding profile:', error);
    if (
      (error.message && error.message.includes('E11000 duplicate key error')) ||
      (error.message.includes('Email') && error.message.includes('already exists'))
    ) {
      return res.status(409).json({ success: false, error: 'Profile with this email already exists.' });
    }
    res.status(500).json({ success: false, error: 'Failed to add profile', details: error.message });
  }
});

// using getProfilesCollection()
// profiles.get('/from', async (req, res) => {
//   try {
//     // Await the function call to get the collection
//     const collection = await getProfilesCollection();
//     // Fetch all profiles from the collection
//     const sanitizeProfiles = await collection.find({}).toArray();
//     // Log and respond with data
//     console.log(sanitizeProfiles, 'ProfilesCollection from getProfilesCollection()');
//     res.json({
//       success: true,
//       count: sanitizeProfiles.length,
//       data: sanitizeProfiles,
//     });
//   } catch (error) {
//     console.error('Error fetching profiles:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch profiles' });
//   }
// });

module.exports = profiles;
