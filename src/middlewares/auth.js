const jwt = require('jsonwebtoken');
const { getUsersCollection } = require('../db/mongoClient');

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).send('Please login');

    const decoded = jwt.verify(token, process.env.BCRYPT_PASS); // consider using env var
    const _id = decoded._id;

    const collection = await getUsersCollection();
    const user = await collection.findOne({ _id });

    if (!user) throw new Error('No user found');

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send('ERR: ' + err.message);
  }
};

module.exports = { userAuth };
