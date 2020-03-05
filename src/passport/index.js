const User = require('models/user');
const logger = require('logger');
const local = require('./localStrategy');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (_id, done) => {
    try {
      const user = await User.findOne({ _id }).exec();
      done(null, user);
    } catch (error) {
      logger.error(error);
      done(error);
    }
  });

  local(passport);
};
