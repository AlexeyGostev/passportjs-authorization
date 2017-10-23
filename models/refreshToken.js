const crypto = require('crypto');
const log = require('../libs/log.js')(module);
const mongoose = require('../libs/mongoose');
const Schema = mongoose.Schema;

let schema = new Schema({
    username: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

let RefreshToken = mongoose.model('RefreshToken', schema);
module.exports = RefreshToken;