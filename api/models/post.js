const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const post = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Post', post);