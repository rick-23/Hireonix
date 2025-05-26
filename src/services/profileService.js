const crypto = require('crypto');
const { getProfilesCollection } = require('../db/mongoClient');
const { extractIdentifiers } = require('../utils/extractIdentifiers');

const storeProfile = async (input) => {
  try {
    const { fileName, fileContent } = input;

    const identifiers = extractIdentifiers(fileContent);
    const { name, email } = identifiers;

    if (!email || !name) {
      throw new Error('Missing required identifiers from resume');
    }

    const collection = await getProfilesCollection();
    // console.log(collection, 'Collection from profileService');

    // **First, check for an existing profile by email**
    const existingProfile = await collection.findOne({ email });

    if (existingProfile) {
      throw new Error(`Email ${email} already exists under a different profile.`);
    }

    // If no existing profile with this email, proceed to create a new one based on BOTH name and email.
    const combinedKey = `${name.toLowerCase().trim()}_${email.toLowerCase().trim()}`;
    const profileId = crypto.createHash('md5').update(combinedKey).digest('hex');

    const profile = {
      _id: profileId,
      name,
      email,
      fileName,
      fileContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(profile);

    return { profile };
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error so the calling Express route can catch it.
  }
};

module.exports = {
  storeProfile,
};
