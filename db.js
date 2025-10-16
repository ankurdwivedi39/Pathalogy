const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/pathalogy');
        console.log("✅ MongoDB Connected...");
    } catch (err) { // <-- Yahan err define kar diya
        console.error("❌ MongoDB connection Failed:", err.message);
        process.exit(1); // Optional: server band kar do agar DB nahi chala
    }
};

module.exports = connectDB;
