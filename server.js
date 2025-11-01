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

app.get('/Packages', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Packages', 'packages.html'));   
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
 
// ------------- login database -------------

app.post("/Login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are given
    if (!email || !password) {
      return res.status(400).send("Please enter both email and password");
    }

    // 1️⃣ Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    // 2️⃣ Compare plain password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch); // Debugging ke liye

    if (!isMatch) {
      return res.status(401).send("Invalid email or password");
    }

    // 3️⃣ Login success
    console.log("User logged in:", user.email);
    res.status(200).send("Login successful!");
    // ya tu chahe to redirect bhi kar sakta hai
    // res.redirect("/dashboard");

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error during login");
  }
});



 // --------- start server ------
 app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
 });