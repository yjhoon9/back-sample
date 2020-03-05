const express = require('express');
const postsCtrl = require('./posts.ctrl');
const { checkObjectId, isLoggedIn } = require('../middlewares');

const posts = express.Router();

posts.get('/', postsCtrl.list);
posts.get('/url', postsCtrl.readByUrl);
posts.get('/:id', checkObjectId, postsCtrl.read);

posts.post('/', isLoggedIn, postsCtrl.write);

posts.delete('/:id', isLoggedIn, checkObjectId, postsCtrl.remove);

posts.patch('/:id', isLoggedIn, checkObjectId, postsCtrl.update);

module.exports = posts;
