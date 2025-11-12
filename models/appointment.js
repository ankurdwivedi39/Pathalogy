const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    // Link to the User who made the booking
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    // Customer Contact Details (redundant storage for quick lookup)
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: true,
    },

    // 🔑 ADDED FIELDS FOR HOME COLLECTION ADDRESS
    deliveryAddress: {
        type: String,
        required: false, // Enforced by server only for Home Collection
    },
    city: {
        type: String,
        required: false, // Enforced by server only for Home Collection
    },
    pincode: {
        type: String,
        required: false, // Enforced by server only for Home Collection
    },

    // Appointment Details
    appointmentDateTime: {
        type: Date,
        required: true,
    },
    
    // 💡 NEW FIELD: Store the MongoDB ID of the selected lab center
    labCenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
       
    },
    
    // Type of service requested
    collectionType: {
        type: String,
        enum: ['Home Collection', 'Lab Visit'],
        default: 'Home Collection',
    },
    // List of tests/packages booked
    testsBooked: [{
        itemId: String, // e.g., T1, Path-05
        name: String,
        price: Number,
        quantity: {
            type: Number,
            default: 1
        }
    }],
    
    // Total cost of the order
    totalPrice: {
        type: Number,
        required: true,
    },

    // 🔑 NEW FIELD: Tracks the payment state
    paymentStatus: {
        type: String,
        enum: ['Pending Payment', 'Paid (CoSC)', 'Paid (Online)', 'Refunded'],
        default: 'Pending Payment',
    },

    // Management Status
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Sample Collected', 'Processing', 'Report Ready', 'Cancelled'],
        default: 'Pending',
    },
    
    // When the appointment was created
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);