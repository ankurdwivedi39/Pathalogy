const mongoose = require('mongoose');

// Schema for an individual Test or a Health Package
const TestPackageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Used to distinguish between a single test and a full package
    type: {
        type: String,
        enum: ['test', 'package'],
        required: true
    },
    // The current selling price
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // The original/strike-through price (optional)
    originalPrice: {
        type: Number,
        min: 0
    },
    // Short description or parameter count (e.g., "60 Parameters Covered")
    description: {
        type: String
    },
    // Status for visibility on the public site
    isPublished: {
        type: Boolean,
        default: true
    },
    // Internal reference ID (e.g., PT1, Path-04)
    itemId: {
        type: String,
        unique: true
    },
    // Array of details/features (for packages) - e.g., ["Free Home Sample Collection"]
    features: [String] 
});

module.exports = mongoose.model('TestPackage', TestPackageSchema);