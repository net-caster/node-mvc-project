const express = require('express');
const router = express.Router();

const PagesController = require('../controllers/pages');

router.get('/login', PagesController.getLogin);

router.post('/login', PagesController.postLogin);

router.get('/', PagesController.getIndex);

router.get('/about', PagesController.getAbout);

router.get('/contact', PagesController.getContact);

router.get('/news', PagesController.getNews);

router.get('/news/:postId', PagesController.getPost);

router.get('/logout', PagesController.getLogout);

module.exports = router;