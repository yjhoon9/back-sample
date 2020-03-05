const LocalStrategy = require('passport-local').Strategy;
const logger = require('logger');
const User = require('models/user');

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      async (username, password, done) => {
        try {
          const exUser = await User.findOne({ username }).exec();
          if (exUser) {
            const result = await exUser.validatePassword(password);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: 'incorrect password' });
            }
          } else {
            done(null, false, { message: 'user not exsit' });
          }
        } catch (error) {
          logger.error(error);
          done(error);
        }
      },
    ),
  );
};
