const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        unique: true // Ensure only one token per appointment
    },
    // Token identifier (e.g., K-001, H-005)
    tokenNumber: {
        type: String,
        required: true,
        unique: true
    },
    // User's name (for easy lookup/display)
    customerName: {
        type: String,
        required: true
    },
    // Type of service which dictates the queue
    serviceType: {
        type: String, 
        enum: ['Lab Visit', 'Home Collection'], // Matches Appointment model
        required: true
    },
    // Status in the queue
    status: {
        type: String,
        enum: ['Waiting', 'Processing', 'Complete', 'Cancelled'],
        default: 'Waiting'
    },
    // Time the token was created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Token', TokenSchema);