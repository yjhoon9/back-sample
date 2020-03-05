const express = require('express');

const auth = express.Router();
const authCtrl = require('./auth.ctrl');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');

auth.post('/login', isNotLoggedIn, authCtrl.login);
auth.post('/signup', isNotLoggedIn, authCtrl.signup);
auth.post('/logout', isLoggedIn, authCtrl.logout);

module.exports = auth;
