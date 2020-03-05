const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;
const { Schema } = mongoose;

const Comment = new Schema({
  writer: String,
  content: String,
  registeredDate: {
    type: Date,
    default: new Date(),
  },
});

const OnlineCounselling = new Schema({
  title: String,
  writer: String,
  password: String,
  content: String,
  reply: { type: Boolean, default: false },
  registeredDate: {
    type: Date,
    default: new Date(),
  },
  comments: {
    type: [Comment],
    default: [],
  },
});

OnlineCounselling.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

OnlineCounselling.methods.validatePassword = async function validatePassword(password) {
  return bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('OnlineCounselling', OnlineCounselling);
