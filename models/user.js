const mongoose = require("mongoose")

//User schema
const userSchema = new mongoose.Schema({
    username : {type: String, required: true, unique: true},
    email : {type: String, required: true, unique: true},
    password :{type: String, required: true}
   // ConfirmPassword :{type: String, required: true}

})

// // token schema 
// const tokenSchema = new mongoose.Schema({
//   type: { type: String, enum: ["lab", "home"], required: true },
//   tokenNumber: { type: String, required: true, unique: true },
//   name: String,
//   testName: String,
//   status: { type: String, default: "waiting" },
//   createdAt: { type: Date, default: Date.now },
// });

module.exports = mongoose.model("User",userSchema)
