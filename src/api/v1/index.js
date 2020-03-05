const express = require('express');
const posts = require('./posts');
const onlineCounsellings = require('./online_counsellings');
const reservations = require('./reservations');
const auth = require('./auth');

const api = express.Router();

api.use('/posts', posts);
api.use('/online-counsellings', onlineCounsellings);
api.use('/reservations', reservations);
api.use('/auth', auth);

module.exports = api;
