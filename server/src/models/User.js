const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    socketID: String,
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);