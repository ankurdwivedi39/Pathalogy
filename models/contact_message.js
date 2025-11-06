const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    // Track when the message was received
    receivedAt: {
        type: Date,
        default: Date.now
    },
    // Admin tracking: whether the message has been reviewed
    isRead: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);