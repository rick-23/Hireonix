const validator = require('validator');

function validateSignUp(req) {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error('Enter validate names');
  }
  if (!validator.isEmail(email)) {
    throw new Error('Enter validate email');
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error('Enter validate password');
  }
}

function validateLogin(req) {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    throw new Error('Enter validate email');
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error('Enter validate password');
  }
}

module.exports = { validateSignUp, validateLogin };
