const mongoose = require("mongoose")

const connectDB = async () => {
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/UserDatabase")
        console.log("MongoDB Connected...")

//          // 🔹 Cleanup code starts here
//   const result = await User.deleteMany({ usernmae: null });
//   console.log('Deleted documents with usernmae:null ->', result.deletedCount);
//   // 🔹 Cleanup code ends here

    }catch{
        console.error("MongoDB connection Failed :",err);
        process.exit(1)
    }
}

module.exports = connectDB