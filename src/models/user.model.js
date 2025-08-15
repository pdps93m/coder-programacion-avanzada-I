const mongoose = require('mongoose');

const userCollection = 'usuarios';

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
});

const userModel = mongoose.model(userCollection, userSchema);

module.exports = userModel;