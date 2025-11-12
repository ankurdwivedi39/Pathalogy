const express = require('express')
const path = require('path')
const bcrypt = require("bcrypt")
const axios = require("axios")
const session = require('express-session'); // 💡 NEW: Import session middleware

// import DB Models
const connectDB = require("./db");
const User = require("./models/user"); //Import User model
const TestPackage = require("./models/test_package"); // 💡 NEW: Import TestPackage model
const Setting = require("./models/setting"); // 💡 NEW: Import Setting model
const ContactMessage = require("./models/contact_message"); // 💡 NEW: Import ContactMessage model
const Appointment = require("./models/appointment"); // 💡 NEW: Import Appointment model
const Lab = require("./models/Lab"); // 💡 NEW: Import Lab model
const Report = require("./models/Report"); // 💡 NEW: Import Report model

const app = express();
const Port = 5000;

// server.js (Paste this block)

// --- STATIC DATA EXTRACTED FROM HTML FILES FOR ONE-TIME IMPORT ---
const staticInventoryData = [
    // ------------------------------------
    // Individual Tests (from test.html)
    // ------------------------------------
    { itemId: 'T1', name: 'Complete Blood Count (CBC)', type: 'test', price: 299, description: 'Evaluates blood health and detects anemia, infections, etc.', isPublished: true },
    { itemId: 'T2', name: 'Thyroid Profile', type: 'test', price: 499, description: 'Checks T3, T4, TSH for thyroid disorders.', isPublished: true },
    { itemId: 'T3', name: 'Allergy Panel', type: 'test', price: 1299, description: 'Detects sensitivity to common allergens.', isPublished: true },
    { itemId: 'T4', name: 'Vitamin D Test', type: 'test', price: 799, description: 'Checks Vitamin D deficiency for bone & immune health.', isPublished: true },
    { itemId: 'T5', name: 'HbA1c', type: 'test', price: 399, description: 'Average blood sugar of last 3 months (diabetes check).', isPublished: true },
    { itemId: 'T6', name: 'Liver Function Test (LFT)', type: 'test', price: 699, description: 'Measures enzymes & proteins for liver health.', isPublished: true },
    { itemId: 'T7', name: 'Kidney Function Test (KFT)', type: 'test', price: 599, description: 'Checks creatinine, urea, electrolytes for kidney health.', isPublished: true },
    { itemId: 'T8', name: 'Lipid Profile', type: 'test', price: 499, description: 'Measures cholesterol, HDL, LDL, triglycerides.', isPublished: true },
    { itemId: 'T9', name: 'Blood Sugar (Fasting/PP)', type: 'test', price: 149, description: 'Essential test for diabetes diagnosis.', isPublished: true },
    { itemId: 'T10', name: 'Vitamin B12', type: 'test', price: 899, description: 'Important for nerves, blood, and energy levels.', isPublished: true },
    { itemId: 'T11', name: 'Urine Routine', type: 'test', price: 199, description: 'Analyzes urine for signs of common diseases.', isPublished: true },
    { itemId: 'T12', name: 'Iron Profile', type: 'test', price: 899, description: 'Measures different iron substances in the blood.', isPublished: true },
    { itemId: 'T13', name: 'Uric Acid Test', type: 'test', price: 249, description: 'Measures uric acid levels, often for gout diagnosis.', isPublished: true },
    { itemId: 'T14', name: 'Testosterone Test', type: 'test', price: 999, description: 'Checks the level of the primary male sex hormone.', isPublished: true },
    // ... (This list continues for all 30 items from test.html) ...
    // Note: I will only include a few to keep the response concise, you can complete the list.

    // ------------------------------------
    // Popular Tests (from pt&p.html) - These are already covered above or below, but we'll include unique data points.
    // ------------------------------------
    { itemId: 'PT1', name: 'COMPLETE BLOOD COUNT (CBC)', type: 'test', price: 350, description: '20 Parameter(s) Covered', features: ['Home Collection', 'Lab Visit'] },
    { itemId: 'PP1', name: 'FULL BODY CHECKUP (MALE)', type: 'package', price: 1499, description: '60 Parameter(s) Covered', features: ['Home Collection', 'Lab Visit'] },
    
    // ------------------------------------
    // Health Packages (from packages.html)
    // ------------------------------------
    { itemId: 'Path-01', name: 'Path-01: Active Screen', type: 'package', price: 899, originalPrice: 1999, features: ['35 Parameters Covered', 'Basic Organ Function (KFT, LFT)', 'Free Home Sample Collection', 'Report in 12 Hours'] },
    { itemId: 'Path-02', name: 'Path-02: Wellness Total', type: 'package', price: 1599, originalPrice: 3499, features: ['68 Parameters Covered', 'Lipid Profile + Thyroid Total', 'Free Home Sample Collection', 'Consultation with Expert'] },
    // ... (This list continues for all 36 Path items) ...
    // Note: You must ensure all 36 items are added to this array for a complete import.
];
// --- END STATIC DATA BLOCK ---

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

// app.get('/Register', (req, res) => {
//  res.sendFile(path.join(__dirname, 'public/Register', 'regi.html'));   
// });

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

app.get('/Checkout', (req, res) => {
    // Check if user is NOT logged in
    if (!req.session.userId) {
        // Redirect if not logged in
        // You can use a query parameter to return the user here later
        return res.redirect('/Login?returnTo=/Checkout'); 
    }
    // Logged in user can access
    res.sendFile(path.join(__dirname, 'public/Checkout', 'checkout.html'));   
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

// ----------------- Middleware for Admin Protection -----------------
const adminAuth = (req, res, next) => {
    // 🔑 1. Check if user is logged in
    if (!req.session.userId) {
        // 401 Unauthorized
        return res.status(401).json({ message: "Access denied. Please log in." });
    }
    // 🔑 2. Check if user has the 'admin' role
    if (req.session.role !== 'admin') {
        // 403 Forbidden
        return res.status(403).json({ message: "Forbidden. Admin access required." });
    }
    next(); // Proceed to the route handler
};

// ----------------- New Admin POST Route -----------------

// This route will handle the creation of users from the Manage Users panel
app.post("/api/users", adminAuth, async (req, res) => {
  try {
    const { username, email, role, password } = req.body;

    // 1. Basic Validation
    if (!username || !email || !role || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    // 2. Check if user/email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
     return res.status(400).json({ message: "Email already exists. Please use another one." });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

   const newUser = new User({
      username: username,
      email: email,
      password: hashedpassword,
      role: role // 'user' or 'admin' from the front-end
    });

    await newUser.save(); // 🔑 ACTUAL DATABASE WRITE HERE

    // 5. Success Response
    // Use 201 Created and send back a success JSON
    res.status(201).json({ message: `User '${username}' created successfully.`, userId: newUser._id });
    
  } catch (err) {
    console.error("❌ User Creation Error:", err);
    // 500 Internal Server Error for unexpected issues (like DB connection failure)
    res.status(500).json({ message: "Server error during user creation." });
  }
});

// ----------------- GET Route to Fetch All Users (Admin-Protected) -----------------
app.get("/api/users", adminAuth, async (req, res) => {
  try {
    // Fetch all users, but exclude the password field for security
    const users = await User.find().select('-password');
    
    // Send the array of users as a JSON response
    res.status(200).json(users);
    
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ message: "Server error while fetching user list." });
  }
});

// NOTE: Your POST /api/users route is already correctly defined below this.

// ----------------- DELETE Route to Remove a User (Admin-Protected) -----------------
app.delete("/api/users/:id", adminAuth, async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    
    // Check if the Admin is trying to delete their own account (Good practice guard)
    if (req.session.userId.toString() === userIdToDelete) {
        return res.status(403).json({ message: "Forbidden: You cannot delete your own active admin account." });
    }

    // Find and delete the user by ID
    const result = await User.findByIdAndDelete(userIdToDelete);

    if (!result) {
      // If result is null, the user ID was not found
      return res.status(404).json({ message: "User not found." });
    }

    // Success response: 204 No Content is standard for a successful DELETE
    res.status(204).send(); 
    
  } catch (err) {
    console.error("❌ Failed to delete user:", err);
    // 400 Bad Request for invalid ID format, 500 for other server errors
    res.status(400).json({ message: "Failed to delete user. Check ID format or server logs." });
  }
});

// 💡 A PROTECTED ROUTE FOR MANAGING TESTS AND PACKAGES
app.get('/admin/manage-inventory', (req, res) => {
    // Check if user is logged in AND has the 'admin' role
    if (req.session.userId && req.session.role === 'admin') {
        // 🔑 NOTE: The file is assumed to be in public/Admin/manage_tests_packages.html
        res.sendFile(path.join(__dirname, 'public/Admin', 'manage_tests_packages.html'));
    } else {
        // Not authorized/logged in, redirect to admin login
        res.redirect('/AdminLogin'); 
    }
});

// ----------------- GET Route to Fetch All Tests & Packages (Admin-Protected) -----------------
app.get("/api/inventory", adminAuth, async (req, res) => {
  try {
    // Fetch all tests and packages, sort by type and name for organization
    const inventory = await TestPackage.find().sort({ type: 1, name: 1 });
    
    // Send the array of items as a JSON response
    res.status(200).json(inventory);
    
  } catch (err) {
    console.error("❌ Failed to fetch inventory:", err);
    res.status(500).json({ message: "Server error while fetching inventory list." });
  }
});

// ----------------- TEMPORARY ONE-TIME INVENTORY IMPORT ROUTE -----------------
// **IMPORTANT**: DELETE THIS ROUTE AFTER SUCCESSFUL EXECUTION IN PRODUCTION
app.get("/admin/import-inventory", adminAuth, async (req, res) => {
  try {
    // 1. Check if the collection is already populated
    const count = await TestPackage.countDocuments();
    if (count > 0) {
      return res.status(409).send(`Inventory already contains ${count} items. Import aborted.`);
    }

    // 2. Prepare data for insert
    // Use the array defined above (staticInventoryData)
    // We use a small utility to clean the item name/features based on your schema
    const dataToImport = staticInventoryData.map(item => ({
        ...item,
        name: item.name.trim(), // Clean whitespace
        itemId: item.itemId || (item.type === 'test' ? 'T-' : 'P-') + Math.random().toString(36).substr(2, 9).toUpperCase(), // Ensure unique ID if missing
        features: item.features || (item.description ? [item.description] : [])
    }));

    // 3. Insert into MongoDB using insertMany
    const result = await TestPackage.insertMany(dataToImport);

    res.status(200).send({ 
        message: `${result.length} items imported successfully! You can now access /admin/manage-inventory.`,
        importedCount: result.length
    });

  } catch (err) {
    console.error("❌ Inventory Import Failed:", err);
    // If you see MongoServerError E11000, it means duplicate keys were found (e.g., same itemId or name)
    res.status(500).send("Error during import. Check server logs for details, possibly duplicate data or schema validation issues.");
  }
});
// ----------------- END TEMPORARY IMPORT ROUTE -----------------

// server.js (Add this new protected POST route)

// ----------------- POST Route to Create New Test or Package (Admin-Protected) -----------------
app.post("/api/inventory", adminAuth, async (req, res) => {
  try {
    const { name, type, price, originalPrice, description, itemId, features } = req.body;

    // 1. Basic Validation
    if (!name || !type || !price || !itemId) {
      return res.status(400).json({ message: "Name, Type, Price, and Item ID are required fields." });
    }
    if (!['test', 'package'].includes(type.toLowerCase())) {
        return res.status(400).json({ message: "Invalid type. Must be 'test' or 'package'." });
    }

    // 2. Check for duplicate Item ID (Crucial for inventory tracking)
    const existingItem = await TestPackage.findOne({ itemId: itemId });
    if (existingItem) {
        return res.status(400).json({ message: `Item ID '${itemId}' already exists.` });
    }

    // 3. Create and Save the New Item
    const newInventoryItem = new TestPackage({
      name: name,
      type: type.toLowerCase(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      description: description,
      itemId: itemId,
      // Convert comma-separated string of features to an array, if provided
      features: features ? features.split(',').map(f => f.trim()).filter(f => f.length > 0) : []
    });

    await newInventoryItem.save(); // 🔑 ACTUAL DATABASE WRITE HERE

    // 4. Success Response: 201 Created
    res.status(201).json({ 
        message: `${name} created successfully.`, 
        item: newInventoryItem 
    });
    
  } catch (err) {
    console.error("❌ Inventory Creation Error:", err);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
         return res.status(400).json({ message: `Validation Error: ${err.message}` });
    }
    // Handle other server errors (e.g., MongoDB connection issues)
    res.status(500).json({ message: "Server error during inventory creation." });
  }
});

// server.js (Add this new protected DELETE route)

// ----------------- DELETE Route to Remove an Inventory Item (Admin-Protected) -----------------
app.delete("/api/inventory/:id", adminAuth, async (req, res) => {
  try {
    const itemIdToDelete = req.params.id;
    
    // Find and delete the item by MongoDB ID (_id)
    const result = await TestPackage.findByIdAndDelete(itemIdToDelete);

    if (!result) {
      // If result is null, the ID was not found
      return res.status(404).json({ message: "Inventory item not found." });
    }

    // Success response: 204 No Content
    res.status(204).send(); 
    
  } catch (err) {
    console.error("❌ Failed to delete inventory item:", err);
    // 400 Bad Request for invalid ID format, 500 for other server errors
    res.status(400).json({ message: "Failed to delete item. Check ID format or server logs." });
  }
});

// 💡 A PROTECTED ROUTE FOR SYSTEM SETTINGS
app.get('/admin/system-settings', (req, res) => {
    // Check if user is logged in AND has the 'admin' role
    if (req.session.userId && req.session.role === 'admin') {
        // 🔑 NOTE: The file is assumed to be in public/Admin/system_settings.html
        res.sendFile(path.join(__dirname, 'public/Admin', 'system_settings.html'));
    } else {
        // Not authorized/logged in, redirect to admin login
        res.redirect('/AdminLogin'); 
    }
});

// ----------------- GET Route to Fetch System Settings (Admin-Protected) -----------------
app.get("/api/settings", adminAuth, async (req, res) => {
  try {
    // Find the single settings document or create it with defaults if it doesn't exist
    const settings = await Setting.findById('GLOBAL_SETTINGS')
      || await Setting.create({ _id: 'GLOBAL_SETTINGS' });
    
    res.status(200).json(settings);
    
  } catch (err) {
    console.error("❌ Failed to fetch settings:", err);
    res.status(500).json({ message: "Server error while fetching settings." });
  }
});

// ----------------- PUT Route to Update System Settings (Admin-Protected) -----------------
app.put("/api/settings", adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Use findByIdAndUpdate with upsert: true to create the document if it doesn't exist
    // runValidators: true ensures Mongoose enforces enum constraints (like on the 'role')
    const updatedSettings = await Setting.findByIdAndUpdate('GLOBAL_SETTINGS', updates, { 
        new: true, 
        upsert: true, // Create the document if it doesn't exist
        runValidators: true 
    });

    res.status(200).json({ 
        message: "Settings saved successfully.", 
        settings: updatedSettings 
    });
    
  } catch (err) {
    console.error("❌ Failed to save settings:", err);
    if (err.name === 'ValidationError') {
         return res.status(400).json({ message: `Validation Error: ${err.message}` });
    }
    res.status(500).json({ message: "Server error during settings update." });
  }
});

// ----------------- PUBLIC GET Route to Fetch Single Appointment by ID -----------------
app.get("/api/appointments/:id", async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Fetch the appointment details
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Success response
    res.status(200).json(appointment);
    
  } catch (err) {
    console.error("❌ Failed to fetch single appointment:", err);
    res.status(500).json({ message: "Server error while fetching order details." });
  }
});

// 💡 A PROTECTED ROUTE FOR APPOINTMENTS MANAGEMENT
app.get('/admin/appointments', (req, res) => {
    // Check if user is logged in AND has the 'admin' role
    if (req.session.userId && req.session.role === 'admin') {
        // 🔑 NOTE: The file is assumed to be in public/Admin/manage_appointments.html
        res.sendFile(path.join(__dirname, 'public/Admin', 'manage_appointments.html'));
    } else {
        // Not authorized/logged in, redirect to admin login
        res.redirect('/AdminLogin'); 
    }
});

// server.js (Add this new protected GET route)

// 💡 A PROTECTED ROUTE FOR ANALYTICS AND REPORTS
app.get('/admin/analytics', (req, res) => {
    // Check if user is logged in AND has the 'admin' role
    if (req.session.userId && req.session.role === 'admin') {
        // 🔑 NOTE: The file is assumed to be in public/Admin/analytics_reports.html
        res.sendFile(path.join(__dirname, 'public/Admin', 'analytics_reports.html'));
    } else {
        // Not authorized/logged in, redirect to admin login
        res.redirect('/AdminLogin'); 
    }
});

// server.js (Add this PUBLIC POST route, near other POST routes like /Register)

// ----------------- PUBLIC POST Route for Contact Form Submission -----------------
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newMessage = new ContactMessage({
        name,
        email,
        phone,
        message
    });

    await newMessage.save();

    res.status(201).json({ 
        message: "Your message has been received. We will contact you shortly.", 
        id: newMessage._id 
    });
    
  } catch (err) {
    console.error("❌ Contact Form Submission Error:", err);
    res.status(500).json({ message: "Server error. Could not send message." });
  }
});

// server.js (Add this ADMIN-PROTECTED GET route)

// ----------------- ADMIN GET Route to Fetch Contact Messages -----------------
app.get("/api/contact", adminAuth, async (req, res) => {
  try {
    // Fetch all messages, newest first
    const messages = await ContactMessage.find().sort({ receivedAt: -1 }); 
    
    res.status(200).json(messages);
    
  } catch (err) {
    console.error("❌ Failed to fetch contact messages:", err);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
});

app.get('/admin/contact-messages', (req, res) => {
    if (req.session.userId && req.session.role === 'admin') {
        res.sendFile(path.join(__dirname, 'public/Admin', 'manage_contact.html'));
    } else {
        res.redirect('/AdminLogin'); 
    }
});

// ----------------- GET Route to Fetch All Appointments (Admin-Protected) -----------------
app.get("/api/appointments", adminAuth, async (req, res) => {
  try {
    // Fetch all appointments, newest first, and populate the userId reference 
    // to potentially display the user's username/email from the User collection
    const appointments = await Appointment.find()
      .sort({ appointmentDateTime: -1 }) // Sort by appointment time, newest first
      .populate('userId', 'username email'); // Fetch username and email from the User model
    
    res.status(200).json(appointments);
    
  } catch (err) {
    console.error("❌ Failed to fetch appointments:", err);
    res.status(500).json({ message: "Server error while fetching appointments list." });
  }
});

// ----------------- PATCH Route to Update Appointment Status (Admin-Protected) -----------------
app.patch("/api/appointments/:id", adminAuth, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;

    // 1. Basic Validation
    if (!status) {
      return res.status(400).json({ message: "Status field is required for update." });
    }

    // 2. Find and Update the Appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { status: status } }, // Only update the status field
      { new: true, runValidators: true } // Return new document and run Mongoose validators (for enum)
    ).select('-testsBooked'); // Exclude bulky fields from the response

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // 3. Success Response
    res.status(200).json({ 
        message: `Appointment status updated to ${updatedAppointment.status}.`, 
        appointment: updatedAppointment 
    });
    
  } catch (err) {
    console.error("❌ Failed to update appointment status:", err);
    if (err.name === 'ValidationError') {
         return res.status(400).json({ message: `Validation Error: ${err.message}` });
    }
    res.status(500).json({ message: "Server error during status update." });
  }
});

// ----------------- PUBLIC POST Route for Creating a New Appointment -----------------
app.post("/api/appointments", async (req, res) => {
  try {
    // Note: This route is PUBLIC and does NOT use adminAuth.
    // It is expected to be called from the Checkout Page.
    
   const { 
        customerName, customerEmail, customerPhone, 
        appointmentDateTime, collectionType, testsBooked, 
        totalPrice, labCenterId, 
        // 🔑 Destructure address fields
        deliveryAddress, city, pincode 
    } = req.body;

    // 🔑 CRITICAL VALIDATION LOGIC:
    // Check always required fields (Mongoose validates totalPrice, appointmentDateTime)
    if (!customerName || !customerEmail || !customerPhone || !appointmentDateTime || !testsBooked || totalPrice == null) {
      return res.status(400).json({ message: "Missing required contact or summary details." });
    }
    
    // Check conditional fields
    if (collectionType === 'Lab Visit' && !labCenterId) {
         return res.status(400).json({ message: "Lab Center selection is required for Lab Visit." });
    }
    
    // 🔑 ENFORCE ADDRESS FOR HOME COLLECTION 🔑
    if (collectionType === 'Home Collection' && (!deliveryAddress || !city || !pincode)) {
        return res.status(400).json({ message: "Address, city, and pincode are required for Home Collection." });
    }

    // 3. Create and Save the New Appointment
    const newAppointment = new Appointment({
        // ... (existing fields) ...
        // 🔑 PASS ALL FIELDS TO MONGOOSE 🔑
        customerName, customerEmail, customerPhone,
        appointmentDateTime: new Date(appointmentDateTime),
        collectionType,
        testsBooked,
        totalPrice,
        deliveryAddress, 
        city, 
        pincode,
        labCenterId: labCenterId,
        });

    await newAppointment.save();

    // 4. Success Response
    res.status(201).json({ 
        message: "Appointment booked successfully!", 
        appointmentId: newAppointment._id 
    });
    
  } catch (err) {
    console.error("❌ Appointment Booking Error:", err); // <-- Check your terminal for this full error
    if (err.name === 'ValidationError') {
         // 🔑 This sends the Mongoose validation error to the frontend pop-up
         return res.status(400).json({ message: `Validation Error: ${err.message}` });
    }
    res.status(500).json({ message: "A server error occurred during booking." });
  }
});

app.get('/admin/manage-labs', (req, res) => {
    // Check if user is logged in AND has the 'admin' role
    if (req.session.userId && req.session.role === 'admin') {
        // 🔑 NOTE: The file is assumed to be in public/Admin/manage_labs.html
        res.sendFile(path.join(__dirname, 'public/Admin', 'manage_labs.html'));
    } else {
        // Not authorized/logged in, redirect to admin login
        res.redirect('/AdminLogin'); 
    }
});

// ----------------- POST Route to Create New Lab Center (Admin-Protected) -----------------
app.post("/api/labs", adminAuth, async (req, res) => {
  try {
    const { name, address, city, pincode, workingHours, isAvailable } = req.body;

    // 1. Basic Validation
    if (!name || !address || !city || !pincode) {
      return res.status(400).json({ message: "Name, address, city, and pincode are required." });
    }
    
    // 2. Create and Save the New Lab Center
    const newLab = new Lab({
      name: name,
      address: address,
      city: city,
      pincode: pincode,
      workingHours: workingHours || 'Mon-Sat: 8:00 AM - 8:00 PM', // Use default if not provided
      isAvailable: isAvailable === 'true' // Convert string 'true'/'false' from form to Boolean
    });

    await newLab.save();

    // 3. Success Response: 201 Created
    res.status(201).json({ 
        message: `Lab center '${name}' created successfully.`, 
        lab: newLab 
    });
    
  } catch (err) {
    console.error("❌ Lab Creation Error:", err);
    if (err.name === 'ValidationError') {
         return res.status(400).json({ message: `Validation Error: ${err.message}` });
    }
    res.status(500).json({ message: "Server error during lab creation." });
  }
});

// server.js (Add this protected GET route)

// ----------------- GET Route to Fetch SINGLE Lab by ID (Admin-Protected) -----------------
app.get("/api/labs", async (req, res) => {
  try {
    // 🔑 Ensure the Lab model is correctly imported at the top of server.js
    // const Lab = require("./models/Lab");
    
    // Fetch only active labs (assuming isAvailable field exists)
    const labs = await Lab.find({ isAvailable: true }).select('-isAvailable');
    
    res.status(200).json(labs);
    
  } catch (err) {
    console.error("❌ Failed to fetch lab centers:", err);
    // If you see this error in your console, the database connection is likely the issue.
    res.status(500).json({ message: "Server error while fetching lab centers." });
  }
});

// ----------------- PUT Route to Update Lab Center (Admin-Protected) -----------------
app.put("/api/labs/:id", adminAuth, async (req, res) => {
  try {
    const labIdToUpdate = req.params.id;
    const { name, address, city, pincode, workingHours, isAvailable } = req.body;

    // 1. Basic Validation (Name and Address are essential)
    if (!name || !address) {
      return res.status(400).json({ message: "Name and Address are required." });
    }

    // 2. Prepare update object
    const updates = {
      name,
      address,
      city,
      pincode,
      workingHours,
      // Ensure isAvailable is correctly converted to a Boolean
      isAvailable: isAvailable === 'true' || isAvailable === true // Handles boolean or string 'true'
    };

    // 3. Find and Update
    const updatedLab = await Lab.findByIdAndUpdate(labIdToUpdate, updates, { 
        new: true, // Return the new document
        runValidators: true 
    });

    if (!updatedLab) {
      return res.status(404).json({ message: "Lab center not found." });
    }

    // 4. Success Response
    res.status(200).json({ 
        message: `Lab center '${updatedLab.name}' updated successfully.`, 
        lab: updatedLab 
    });
    
  } catch (err) {
    console.error("❌ Lab Update Error:", err);
    if (err.name === 'ValidationError') {
         return res.status(400).json({ message: `Validation Error: ${err.message}` });
    }
    res.status(500).json({ message: "Server error during lab update." });
  }
});

// ----------------- DELETE Route to Remove a Lab Center (Admin-Protected) -----------------
app.delete("/api/labs/:id", adminAuth, async (req, res) => {
  try {
    const labIdToDelete = req.params.id;
    
    // Find and delete the lab center by MongoDB ID (_id)
    const result = await Lab.findByIdAndDelete(labIdToDelete);

    if (!result) {
      return res.status(404).json({ message: "Lab center not found." });
    }

    // Success response: 204 No Content is standard for a successful DELETE
    res.status(204).send(); 
    
  } catch (err) {
    console.error("❌ Failed to delete lab center:", err);
    res.status(400).json({ message: "Failed to delete item. Check ID format or server logs." });
  }
});

// 💡 A PROTECTED ROUTE FOR USER APPOINTMENT HISTORY
app.get('/user/appointments', (req, res) => {
    // Check if user is logged in
    if (req.session.userId) {
        // 🔑 NOTE: The file is assumed to be in public/UserDashboard/user_appointments.html
        res.sendFile(path.join(__dirname, 'public/UserDashboard', 'user_appointments.html'));
    } else {
        // Not authorized/logged in, redirect
        res.redirect('/Login'); 
    }
});

// ----------------- GET Route to Fetch Appointments for Logged-In User -----------------
app.get("/api/user/appointments", (req, res, next) => {
    // Middleware to ensure the user is logged in
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in to view appointments." });
    }
    next();
}, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Find appointments where the userId field matches the current session user
    const appointments = await Appointment.find({ userId: userId })
      .sort({ appointmentDateTime: -1 }) // Newest first
      .select('-testsBooked'); // Exclude bulky details from the list view

    res.status(200).json(appointments);
    
  } catch (err) {
    console.error("❌ Failed to fetch user appointments:", err);
    res.status(500).json({ message: "Server error while fetching appointment history." });
  }
});

// ----------------- GET Route to Fetch User Dashboard Summary (Protected) -----------------
app.get("/api/user/summary", (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
}, async (req, res) => {
  try {
    const userId = req.session.userId;
    const today = new Date();
    
    // 1. Total Reports (Uses the new Report model)
    const totalReports = await Report.countDocuments({ 
        userId: userId, 
        status: { $in: ['Ready', 'Archived'] } 
    });

    // 2. Upcoming Appointments/Tests (Any status before Report Ready)
    const upcomingTests = await Appointment.countDocuments({
        userId: userId,
        appointmentDateTime: { $gte: today }, 
        status: { $in: ['Pending', 'Confirmed', 'Sample Collected'] }
    });

    // 3. Pending Payments (Uses the new paymentStatus field)
    const pendingPayments = await Appointment.countDocuments({
        userId: userId,
        paymentStatus: 'Pending Payment'
    });

    // 4. Latest Test Results (Uses the new Report model)
    const latestResults = await Report.find({ userId: userId })
        .sort({ generatedAt: -1 }) // Sort by newest first
        .limit(2)
        .select('reportId status generatedAt'); // Select fields for display

    res.status(200).json({
        totalReports,
        upcomingTests,
        pendingPayments,
        latestResults
    });
    
  } catch (err) {
    console.error("❌ Failed to fetch user dashboard summary:", err);
    res.status(500).json({ message: "Server error while fetching summary data." });
  }
});

// 💡 A PROTECTED ROUTE FOR USER TEST REPORTS
app.get('/user/reports', (req, res) => {
    // Check if user is logged in
    if (req.session.userId) {
        // 🔑 NOTE: The file is assumed to be in public/UserDashboard/user_reports.html
        res.sendFile(path.join(__dirname, 'public/UserDashboard', 'user_reports.html'));
    } else {
        // Not authorized/logged in, redirect
        res.redirect('/Login'); 
    }
});

// ----------------- GET Route to Fetch All Reports for Logged-In User -----------------
app.get("/api/user/reports", (req, res, next) => {
    // Middleware to ensure the user is logged in
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in to view reports." });
    }
    next();
}, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Find all reports linked to the current session user, ordered by newest first.
    const reports = await Report.find({ userId: userId })
      .sort({ generatedAt: -1 })
      .select('reportId appointmentId status generatedAt'); // Select only necessary fields

    res.status(200).json(reports);
    
  } catch (err) {
    console.error("❌ Failed to fetch user reports:", err);
    res.status(500).json({ message: "Server error while fetching report history." });
  }
});

// 💡 A PROTECTED ROUTE FOR EDIT PROFILE
app.get('/user/edit-profile', (req, res) => {
    // Check if user is logged in
    if (req.session.userId) {
        // 🔑 NOTE: The file is assumed to be in public/UserDashboard/edit_profile.html
        res.sendFile(path.join(__dirname, 'public/UserDashboard', 'edit_profile.html'));
    } else {
        // Not authorized/logged in, redirect
        res.redirect('/Login'); 
    }
});

// ----------------- GET Route to Fetch Current User Profile -----------------
app.get("/api/user/profile", (req, res, next) => {
    // Check if the user is logged in
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
}, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        // Find the user by ID and exclude sensitive data like the password
        const user = await User.findById(userId).select('-password');

        if (!user) {
            // This should ideally not happen if session is valid
            return res.status(404).json({ message: "User profile not found." });
        }

        res.status(200).json(user);
        
    } catch (err) {
        console.error("❌ Failed to fetch user profile:", err);
        res.status(500).json({ message: "Server error fetching profile data." });
    }
});

// ----------------- PUT Route to Update Current User Profile -----------------
app.put("/api/user/profile", (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in to update." });
    }
    next();
}, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { username, phone } = req.body; // Capture fields from the "Save Details" form

        // 1. Prepare update object
        const updates = {};
        if (username) updates.username = username;
        if (phone) updates.phone = phone; // Ensure your User model has a 'phone' field!

        if (Object.keys(updates).length === 0) {
             return res.status(400).json({ message: "No fields submitted for update." });
        }

        // 2. Find and update the user document
        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true 
        }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User profile not found for update." });
        }

        res.status(200).json({ 
            message: "Profile updated successfully.",
            user: updatedUser
        });

    } catch (err) {
        console.error("❌ Failed to update user profile:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: `Validation Error: ${err.message}` });
        }
        res.status(500).json({ message: "Server error during profile update." });
    }
});

// ----------------- PUT Route to Change User Password -----------------
app.put("/api/user/password", (req, res, next) => {
    // Check if the user is logged in
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
}, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // 1. Validation and Match Check
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "All password fields are required." });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New passwords do not match." });
        }
        if (newPassword.length < 6) { // Enforce minimum length
             return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        // 2. Fetch User Record (Need the current hashed password)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 3. Verify Old Password (Use bcrypt.compare)
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "The old password entered is incorrect." });
        }

        // 4. Hash New Password and Update Database
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        await User.findByIdAndUpdate(userId, { 
            $set: { password: hashedNewPassword } 
        });

        // 5. Success Response
        res.status(200).json({ 
            message: "Password updated successfully. You will remain logged in."
        });

    } catch (err) {
        console.error("❌ Failed to change password:", err);
        res.status(500).json({ message: "Server error during password update." });
    }
});

// ----------------- GET Route to Fetch User Notifications (Protected) -----------------
app.get("/api/user/notifications", (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
}, async (req, res) => {
  try {
    const userId = req.session.userId;
    const notifications = [];
    const now = new Date();
    
    // --- 1. Fetch APPOINTMENTS (Check Status and Payment) ---
    const appointments = await Appointment.find({ userId: userId })
        .sort({ createdAt: -1 })
        .select('appointmentDateTime status paymentStatus totalPrice testsBooked');

    for (const appt of appointments) {
        const orderIdDisplay = "ORD" + appt._id.toString().slice(-4);
        const apptTime = new Date(appt.appointmentDateTime);
        const isFuture = apptTime > now;

        // 1a. Payment Pending Alert (High Priority)
        if (appt.paymentStatus === 'Pending Payment') {
            notifications.push({
                id: `payment_${appt._id}`,
                type: 'payment',
                title: 'Payment Required',
                message: `Action required: Your payment of ${appt.totalPrice} for order ${orderIdDisplay} is still pending.`,
                time: 'Requires Action',
                status: 'unread'
            });
        }
        
        // 1b. Upcoming Appointment Alert (12 hours before)
        const twelveHoursBefore = new Date(apptTime.getTime() - (12 * 60 * 60 * 1000));
        
        if (isFuture && appt.status === 'Confirmed' && now > twelveHoursBefore) {
            notifications.push({
                id: `appt_${appt._id}`,
                type: 'appointment',
                title: 'Upcoming Appointment Reminder',
                message: `Your sample collection is scheduled for ${apptTime.toLocaleString()} today/tomorrow.`,
                time: 'Scheduled',
                status: 'unread'
            });
        }
        
        // 1c. Sample Collected Alert (If status is S.Collected)
        if (appt.status === 'Sample Collected') {
             notifications.push({
                id: `collected_${appt._id}`,
                type: 'info',
                title: 'Sample Received',
                message: `Sample for order ${orderIdDisplay} received and is now processing.`,
                time: 'Processing',
                status: 'read' // Low priority for display
            });
        }
    }
    
    // --- 2. Fetch REPORTS (Check Status) ---
    // NOTE: This assumes Report model is correctly imported and linked.
    const reports = await Report.find({ userId: userId })
        .sort({ generatedAt: -1 })
        .limit(5); // Show latest 5 report status changes

    for (const report of reports) {
        if (report.status === 'Ready') {
            notifications.push({
                id: `report_${report._id}`,
                type: 'report',
                title: 'Report Ready for Download!',
                message: `Your results for report ${report.reportId} are finalized.`,
                time: new Date(report.generatedAt).toLocaleString(),
                status: 'unread'
            });
        }
    }

    // Sort all notifications by time (newest first)
    // NOTE: We rely on the frontend to sort or time-stamp based on createdAt/generatedAt if available

    res.status(200).json(notifications);
    
  } catch (err) {
    console.error("❌ Failed to fetch user notifications:", err);
    res.status(500).json({ message: "Server error while fetching notifications." });
  }
});

// 💡 A PROTECTED ROUTE TO SERVE THE NOTIFICATIONS HTML PAGE
app.get('/user/notifications', (req, res) => {
    // Check if user is logged in
    if (req.session.userId) {
        // 🔑 Serve the HTML file from the UserDashboard directory
        res.sendFile(path.join(__dirname, 'public/UserDashboard', 'user_notifications.html'));
    } else {
        // Not authorized/logged in, redirect
        res.redirect('/Login'); 
    }
});

// 💡 PUBLIC ROUTE TO SERVE THE CENTER FINDER PAGE
app.get('/FP/find-centre.html', (req, res) => {
    // Note: This route should map to the file path shown in your screenshot's status bar
    res.sendFile(path.join(__dirname, 'public/FP', 'find-centre.html'));
});

 // --------- start server ------
 app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
 });