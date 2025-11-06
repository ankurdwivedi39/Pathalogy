const mongoose = require('mongoose');

// Schema for global application settings. 
// Note: We use a fixed document ID to ensure there is only one settings document.
const SettingSchema = new mongoose.Schema({
    // Fixed ID to ensure only one document exists
    _id: {
        type: String,
        default: 'GLOBAL_SETTINGS'
    },
    
    // General Settings
    siteName: {
        type: String,
        default: 'Khushipath'
    },
    defaultRegistrationRole: {
        type: String,
        enum: ['user', 'admin', 'manager'],
        default: 'user'
    },
    defaultReportDeliveryTime: {
        type: Number,
        default: 24,
        min: 1
    },
    
    // API & Integration
    paymentGatewayApiKey: {
        type: String,
        default: 'sk_test_PLACEHOLDER'
    },
    smsGatewayUrl: {
        type: String,
        default: 'https://api.sms.com/send'
    },
    adminEmail: {
        type: String,
        default: 'admin@khushipath.com'
    }
}, { _id: false }); // Prevent Mongoose from creating its own ObjectId

module.exports = mongoose.model('Setting', SettingSchema);