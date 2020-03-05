const express = require('express');

const onlineCounsellingCtrl = require('./online_counselling.ctrl');
const { checkObjectId, isLoggedIn } = require('../middlewares');

const onlineCounsellings = express.Router();

onlineCounsellings.get('/', onlineCounsellingCtrl.list);
onlineCounsellings.get('/:id', checkObjectId, onlineCounsellingCtrl.read);

onlineCounsellings.post('/', isLoggedIn, onlineCounsellingCtrl.write);

onlineCounsellings.post(
  '/:id/comments',
  isLoggedIn,
  onlineCounsellingCtrl.writeComment,
);

onlineCounsellings.delete(
  '/:id',
  isLoggedIn,
  checkObjectId,
  onlineCounsellingCtrl.remove,
);

onlineCounsellings.patch(
  '/:id',
  isLoggedIn,
  checkObjectId,
  onlineCounsellingCtrl.update,
);

module.exports = onlineCounsellings;
