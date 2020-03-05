const User = require('models/user');
const Joi = require('joi');
const passport = require('passport');
const logger = require('logger');

/*
  POST /api/auth
  { username, password }
*/
exports.signup = async (req, res, next) => {
  const schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  // 첫 번째 파라미터는 검증할 객체, 두 번째는 스키마
  const result = Joi.validate(req.body, schema);

  // 오류 발생 시 오류 내용 응답
  if (result.error) {
    return res.status(400).json({
      message: 'schema validation fail'
    });
  }

  const { username, password } = req.body;

  const user = new User({
    username,
    password
  });

  try {
    await user.save(); // 데이터베이스에 등록합니다.
    return res.send(user);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'db error'
    });
  }
};

/*
  POST /api/auth
  { username, password }
*/
exports.login = (req, res, next) => {
  const schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  // 첫 번째 파라미터는 검증할 객체, 두 번째는 스키마
  const result = Joi.validate(req.body, schema);

  // 오류 발생 시 오류 내용 응답
  if (result.error) {
    return res.status(400).json({
      message: 'schema validation fail'
    });
  }

  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      return res.status(500).json({
        message: authError.message
      });
    }
    if (!user) {
      return res.status(400).json({
        message: info.message
      });
    }
    return req.login(user, loginError => {
      if (loginError) {
        return res.status(500).json({
          message: loginError.message
        });
      }
      return res.send(true);
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.status(204).end();
};
