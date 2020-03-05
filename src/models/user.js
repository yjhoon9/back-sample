const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;
const { Schema } = mongoose;

const User = new Schema({
  username: String,
  password: String,
  created: { type: Date, default: new Date() },
});

User.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// compares the password
User.methods.validatePassword = async function validatePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', User);
