const express = require('express');
const router = express.Router();
const checkAuth = require('../../middleware/check-authorization');

const AdminController = require('../../controllers/admin/admin');

// router.get('/', checkAuth, AdminController.user_getAll);

router.get('/profile', checkAuth, AdminController.getProfile);

router.get('/items', checkAuth, AdminController.getAllItems);

router.get('/items/:itemId', checkAuth, AdminController.getItem);

router.get('/add-item', checkAuth, AdminController.getAddItem);

router.get('/edit-item/:itemId', checkAuth, AdminController.getUpdateItem);

router.get('/add-post', checkAuth, AdminController.getAddPost);

router.get('/edit-post/:postId', checkAuth, AdminController.getUpdatePost);

router.post('/add-item', checkAuth, AdminController.postAddItem);

router.post('/edit-item/:itemId', checkAuth, AdminController.postUpdateItem);

router.post('/add-post', checkAuth, AdminController.postAddPost);

router.post('/edit-post/:postId', checkAuth, AdminController.postUpdatePost);

router.post('/signup', checkAuth, AdminController.user_signup);

router.delete('/item/:itemId', checkAuth, AdminController.deleteItem);

router.delete('/user/:userId',checkAuth, AdminController.user_delete);

router.delete('/post/:postId',checkAuth, AdminController.deletePost);

module.exports = router;