const mongoose = require('mongoose');

const LabSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    workingHours: {
        type: String,
        default: 'Mon-Sat: 8:00 AM - 8:00 PM'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Lab', LabSchema);