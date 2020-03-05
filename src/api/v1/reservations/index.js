const express = require('express');
const reservationsCtrl = require('./reservations.ctrl');
const { checkObjectId, isLoggedIn } = require('../middlewares');

const reservations = express.Router();

reservations.get('/', reservationsCtrl.list);

reservations.get('/:id', checkObjectId, reservationsCtrl.read);

reservations.post(
  '/',
  // utils.checkLogin,
  reservationsCtrl.write
);

reservations.delete(
  '/:id',
  // utils.checkLogin,
  checkObjectId,
  reservationsCtrl.remove
);

reservations.patch(
  '/:id',
  // utils.checkLogin,
  checkObjectId,
  reservationsCtrl.update
);

module.exports = reservations;
