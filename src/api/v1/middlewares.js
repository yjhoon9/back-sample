const { ObjectId } = require('mongoose').Types;

exports.checkObjectId = (req, res, next) => {
  const { id } = req.params;

  // 검증 실패
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'invalid ID'
    });
  }

  return next();
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(403).json({ message: 'no authorization' });
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    return res.status(204).end();
  }
};
