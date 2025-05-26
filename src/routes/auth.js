const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userAuth } = require('../middlewares/auth');
const { validateLogin, validateSignUp } = require('../utils/validate');
const { getUsersCollection } = require('../db/mongoClient');
const crypto = require('crypto');

const authRouter = express.Router();
const DEFAULT_PHOTO_URL = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png';
const DEFAULT_ABOUT = 'Hi, I am available';

authRouter.post('/signup', async (req, res) => {
  try {
    validateSignUp(req);

    const { firstName, lastName, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const collection = await getUsersCollection();

    const existing = await collection.findOne({ email });
    if (existing) throw new Error('User already exists');

    //Generating _id
    const name = `${firstName}${lastName}`;
    const combinedKey = `${name.toLowerCase().trim()}_${email.toLowerCase().trim()}`;
    const userId =
      // 'user-' +
      crypto.createHash('md5').update(combinedKey).digest('hex');

    const user = {
      _id: userId,
      firstName,
      lastName,
      email,
      password: passwordHash,
      photoUrl: DEFAULT_PHOTO_URL,
      about: DEFAULT_ABOUT,
    };

    await collection.insertOne(user);

    const token = jwt.sign({ _id: user._id }, process.env.BCRYPT_PASS, {
      expiresIn: '1d',
    });

    res.cookie('token', token, {
      expires: new Date(Date.now() + 24 * 3600000),
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).send('Signup failed: ' + err.message);
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    validateLogin(req);

    const { email, password } = req.body;
    const collection = await getUsersCollection();

    const user = await collection.findOne({ email });
    if (!user) throw new Error('Wrong ID or Password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Wrong ID or Password');

    //jsonwebtoken expiry
    const token = jwt.sign({ _id: user._id }, process.env.BCRYPT_PASS, {
      expiresIn: '1d',
    });

    //Express expiry of cookies
    res.cookie('token', token, {
      expires: new Date(Date.now() + 24 * 3600000),
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).send('Login failed: ' + err.message);
  }
});

authRouter.post('/logout', userAuth, async (req, res) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
    });
    res.send('Logged out successfully : ' + req.user.email);
  } catch (err) {
    res.status(400).send('Logout failed: ' + err.message);
  }
});

//check loggedInUser
authRouter.get('/user/view', userAuth, async (req, res) => {
  try {
    const user = req.user; // coming from middleware
    console.log('user Match', user);

    res.send({ success: true, data: user });
  } catch (err) {
    res.status(400).send('Failed to fetch user: ' + err.message);
  }
});

module.exports = { authRouter };
