const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const item = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        createIndexes: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        createIndexes: true
    },
    imageUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Item', item);