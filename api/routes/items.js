const express = require('express');
const router = express.Router();

const ItemsController = require('../controllers/items');

router.get('/items', ItemsController.items_getAll);

router.get('/items/:itemId', ItemsController.items_getItem);

module.exports = router;