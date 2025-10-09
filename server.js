const express = require('express')
const path = require('path')
const bcrypt = require("bcrypt")
const axios = require("axios")

//import DB Models
const connectDB = require("./db")
const User = require("./models/user")

const app = express();
const Port = 5000;

// Add this 👇 *before* your routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware
//app.use(cors())
//app.use(express.json());

// connect to DB
connectDB()

// static path files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/FP', 'Fp.html'));   
});

app.get('/About', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/About', 'about.html'));   
});

app.get('/Register', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Register', 'regi.html'));   
});

app.get('/Login', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Login', 'login.html'));   
});

app.get('/Contact', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Contact', 'contact.html'));   
});

app.get('/Doctor', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Doctor', 'doctor.html'));   
});

app.get('/Tes', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Tes', 'test.html'));   
});

app.get('/Blog', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Blog', 'blog.html'));   
});

app.get('/TokenGen', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/TokenGen', 'token.html'));   
});

// register database
app.post("/Register", async (req, res) => {
  try {
     console.log(req.body);

    const { username, email, password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
      return res.status(400).send("Password and Confirm Password do not match.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
     return res.status(400).send("Email already exists. Please use another one.");
    }

    const hashedpassword = await bcrypt.hash(password, 10);


   const newUser = new User({
      username: username,
      email: email,
      password: hashedpassword
    });

    await newUser.save();

    res.redirect("/Login");
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user. Username or Email might already exist.");
  }
});

//user Auth
// app.post("/Register" , async (req, res) =>{
//    try{ 
//       const { text, email, password  } = req.body

//       if (password !== password) {
//          return res.status(400).send("Password aur Confirm Password match nahi kar rahe.");
//       }

//       const existingUser = await User.findOne({ email: Email });
//     if (existingUser) {
//       return res.status(400).send("Email already exists. Please use another one.");
//     }

//       const hashedpassword = await bcrypt.hash(Password,10)

//       const newUser = new User({  text, email, password: hashedpassword})
//       await newUser.save()

//       res.redirect("/Login")
//   }catch(err){
//    console.log(err)
//    res.status(500).send("Error registering user. Uesrname/Email might already exist.")
//   }
// }) 





//const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

 // --------- start server ------
 app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
 });