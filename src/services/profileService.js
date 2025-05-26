const crypto = require('crypto');
const { getProfilesCollection } = require('../db/mongoClient');
const { extractIdentifiers } = require('../utils/extractIdentifiers');

const storeProfile = async (input) => {
  const { fileName, fileContent } = input;

  const identifiers = extractIdentifiers(fileContent);
  const { name, email } = identifiers;

  if (!email || !name) {
    throw new Error('Missing required identifiers from resume');
  }

  const combinedKey = `${name.toLowerCase().trim()}_${email.toLowerCase().trim()}`;
  const profileId = crypto.createHash('md5').update(combinedKey).digest('hex');

  const collection = await getProfilesCollection();
  // console.log(collection, 'Collection from profileService');

  const profile = {
    _id: profileId,
    name,
    email,
    fileName,
    fileContent,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existing = await collection.findOne({ email });

  if (existing && existing._id !== profileId) {
    throw new Error(`Email ${email} already exists under a different profile.`);
  }
  
  await collection.updateOne({ _id: profileId }, { $set: profile }, { upsert: true });

  return { profileId };
};

module.exports = {
  storeProfile,
};
