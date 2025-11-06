const express = require('express')
const path = require('path')
const bcrypt = require("bcrypt")
const axios = require("axios")
const session = require('express-session'); // 💡 NEW: Import session middleware

//import DB Models
const connectDB = require("./db")
const User = require("./models/user") // 🚨 NOTE: Make sure your User model has the 'role' field

const app = express();
const Port = 5000;

// ----------------------------------------------------
// 💡 NEW: Configure Session Middleware
// This is essential for keeping track of who is logged in and their role.
app.use(session({
    secret: 'a_strong_secret_key_for_session_management', // Change this to a random, long string!
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));
// ----------------------------------------------------

// Add this 👇 *before* your routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// connect to DB
connectDB()

// static path files
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- Public GET Routes -----------------

app.get('/', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/FP', 'Fp.html'));   
});

app.get('/About', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/About', 'about.html'));   
});

app.get('/Register', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Register', 'regi.html'));   
});

// 💡 User Login Page
app.get('/Login', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Login', 'login.html'));   
});

// 💡 Admin Login Page (You'll need to create this HTML file)
app.get('/AdminLogin', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/AdminLogin', 'adminlogin.html'));   
});

app.get('/Contact', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/Contact', 'contact.html'));   
});

// ----------------- Protected GET Routes (Examples) -----------------

// 💡 A PROTECTED ROUTE FOR STANDARD USERS (NEW LOCATION)
app.get('/user/dashboard', (req, res) => {
    if (req.session.userId) {
        // Logged in user can access
        // 🔑 NOTE: The file is assumed to be in public/UserDashboard/dashboard.html
        res.sendFile(path.join(__dirname, 'public/UserDashboard', 'dashboard.html'));
    } else {
        // Not logged in, redirect
        res.redirect('/Login'); 
    }
});

// 💡 A PROTECTED ROUTE FOR ADMINS ONLY
app.get('/admin/dashboard', (req, res) => {
    // Check if user is logged in AND has the 'admin' role
    if (req.session.userId && req.session.role === 'admin') {
        // Admin can access
        res.sendFile(path.join(__dirname, 'public/Admin', 'dashboard.html'));
    } else {
        // Not authorized/logged in, redirect to admin login
        res.redirect('/AdminLogin'); 
    }
});

// Other static routes can remain simple
app.get('/Doctor', (req, res) => {
    // 🔑 Now treated as a PUBLIC route for displaying the list of doctors
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


// ----------------- POST Routes (Registration & Login) -----------------

// register database (Role is set to 'user' by default)
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
      password: hashedpassword,
      role: 'user' // 🔑 Set default role for new registrations
    });

    await newUser.save();

    res.redirect("/Login");
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user. Username or Email might already exist.");
  }
});


// ------------- User Login Database (POST /Login) -------------

app.post("/Login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Please enter both email and password");
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }
    
    // Optional: Block admins from using the regular login (Good practice for strict separation)
    if (user.role === 'admin') {
        return res.status(401).send("Invalid email or password. Please use the appropriate login."); 
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid email or password");
    }

    // 🔑 User Login Success: Save user info to session
    req.session.userId = user._id;
    req.session.role = user.role;
    console.log("User logged in:", user.email);
    
    // Redirect standard users to their dashboard/home page (NEW LOCATION)
    res.redirect("/user/dashboard"); // ⬅️ UPDATED REDIRECT

  } catch (err) {
    console.error("User Login error:", err);
    res.status(500).send("Server error during login");
  }
});


// ------------- Admin Login Database (POST /AdminLogin) -------------

app.post("/AdminLogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Please enter both email and password");
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      // Use generic message for security
      return res.status(400).send("Invalid email or password"); 
    }
    
    // 🔑 CRUCIAL CHECK: Ensure the user has the 'admin' role
    if (user.role !== 'admin') {
        // If they exist but aren't admin, fail with a generic message
        return res.status(401).send("Invalid email or password"); 
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid email or password");
    }

    // 🔑 Admin Login Success: Save user info to session
    req.session.userId = user._id;
    req.session.role = user.role;
    console.log("Admin logged in:", user.email);
    
    // Redirect successful admin to the admin-only dashboard
    res.redirect("/admin/dashboard"); 

  } catch (err) {
    console.error("Admin Login error:", err);
    res.status(500).send("Server error during admin login");
  }
});

// ----------------- Logout Route -----------------
app.get('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/'); // Redirect to the homepage after logout
    });
});


 // --------- start server ------
 app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
 });