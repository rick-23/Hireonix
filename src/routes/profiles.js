const express = require('express');
const { healthCheck } = require('../utils/healthCheck');
const { connectToDatabase, getProfilesCollection } = require('../db/mongoClient');
const profiles = express.Router();

/* GET home page. */
profiles.get('/', healthCheck);

/* GET all profiles */
profiles.get('/profiles', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const profiles = await db.collection('Profiles').find({}).toArray();
    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profiles' });
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
