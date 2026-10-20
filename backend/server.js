// ============================================
// FILE: backend/server.js (FINAL FIXED)
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },



 filename: (req, file, cb) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  cb(null, `${uniqueSuffix}${extension}`);
 }

});

const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);


  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ============================================
// DATABASE CONNECTION
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devportfolio';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// USER MODEL - NO pre('save') MIDDLEWARE!
// ============================================
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ⚠️ NO pre('save') middleware - we'll hash in the route!

const User = mongoose.model('User', UserSchema);

// ============================================
// DEVICE MODEL
// ============================================
const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Server', 'Network Device', 'Workstation', 'Printer', 'Other'], required: true },
  ipAddress: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'online' },
  cpuUsage: { type: Number, default: 0 },
  memoryUsage: { type: Number, default: 0 },
  diskUsage: { type: Number, default: 0 },
  location: { type: String, default: 'Unknown' },
  department: { type: String, default: 'IT' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Device = mongoose.model('Device', DeviceSchema);

// ============================================
// 6. ALERT MODEL (NEW)
// ============================================

// 📌 WHAT: Defines the Alert Schema
// 📌 WHY: Stores network alerts/warnings
// 📌 WHERE: BACKEND model (MongoDB)
const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Alert = mongoose.model('Alert', AlertSchema);

// ============================================
// 7. TICKET MODEL (NEW)
// ============================================

// 📌 WHAT: Defines the Ticket Schema
// 📌 WHY: Stores IT support tickets
// 📌 WHERE: BACKEND model (MongoDB)
const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    default: 'Unassigned'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Ticket = mongoose.model('Ticket', TicketSchema);

// ============================================
// AUTH MIDDLEWARE
// ============================================
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ============================================
// AUTH ROUTES
// ============================================

// REGISTER - Create new user
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration request received:', req.body);
    
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password directly in the route (no pre('save') middleware needed)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with hashed password
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'mysecretkey123',
      { expiresIn: '7d' }
    );
    
    console.log('✅ User registered:', user.email);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// LOGIN - Authenticate user
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login request received:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'mysecretkey123',
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in:', user.email);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});



// Upload Route


app.post('/api/upload', authenticate, upload.single('image'), (req, res) => {
  try {
    if(!req.file) {
      return res.status(400).json({ message: 'No File uploaded' });
    }
  



    const fileUrl = `/uploada/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });

  } catch (error) {
    console.error('upload error:', error);
    res.status(500).json({ message: 'upload failed: ' + error.message });
  }

})

// ============================================
// DEVICE ROUTES
// ============================================

// GET all devices
app.get('/api/devices', authenticate, async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST - Create device
app.post('/api/devices', authenticate, async (req, res) => {
  try {
    const device = new Device({
      ...req.body,
      createdBy: req.user._id
    });
    await device.save();
    res.status(201).json(device);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE - Remove device
app.delete('/api/devices/:id', authenticate, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// 8. ALERT ROUTES (NEW)
// ============================================

// 📌 WHAT: Get all alerts
// 📌 METHOD: GET
// 📌 URL: /api/alerts
// 📌 WHY: Fetches all alerts from database
// 📌 WHERE: BACKEND route (REST API endpoint)
// 📌 🔒 Requires authentication
app.get('/api/alerts', authenticate, async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }); // Latest first
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 WHAT: Create a new alert
// 📌 METHOD: POST
// 📌 URL: /api/alerts
// 📌 WHY: Adds a new alert to the database
// 📌 WHERE: BACKEND route (REST API endpoint)
// 📌 🔒 Requires authentication
app.post('/api/alerts', authenticate, async (req, res) => {
  try {
    const alert = new Alert({
      ...req.body,
      createdBy: req.user._id
    });
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 WHAT: Acknowledge an alert
// 📌 METHOD: PUT
// 📌 URL: /api/alerts/:id/acknowledge
// 📌 WHY: Marks an alert as acknowledged
// 📌 WHERE: BACKEND route (REST API endpoint)
// 📌 🔒 Requires authentication
app.put('/api/alerts/:id/acknowledge', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// 9. TICKET ROUTES (NEW)
// ============================================

// 📌 WHAT: Get all tickets
// 📌 METHOD: GET
// 📌 URL: /api/tickets
// 📌 WHY: Fetches all tickets from database
// 📌 WHERE: BACKEND route (REST API endpoint)
// 📌 🔒 Requires authentication
app.get('/api/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }); // Latest first
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 WHAT: Create a new ticket
// 📌 METHOD: POST
// 📌 URL: /api/tickets
// 📌 WHY: Adds a new ticket to the database
// 📌 WHERE: BACKEND route (REST API endpoint)
// 📌 🔒 Requires authentication
app.post('/api/tickets', authenticate, async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      createdBy: req.user._id
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 WHAT: Update a ticket
// 📌 METHOD: PUT
// 📌 URL: /api/tickets/:id
// 📌 WHY: Updates an existing ticket
// 📌 WHERE: BACKEND route (REST API endpoint)
// 📌 🔒 Requires authentication
app.put('/api/tickets/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 WHAT: Delete a ticket
// 📌 METHOD: DELETE
// 📌 URL: /api/tickets/:id
// 📌 WHY: Removes a ticket from the database
// 📌 WHERE: BACKEND route (REST API endpoint)
// 📌 🔒 Requires authentication
app.delete('/api/tickets/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`
  📊 API Endpoints:
  POST   /api/auth/register    - Register user
  POST   /api/auth/login       - Login user
  GET    /api/devices          - Get all devices
  POST   /api/devices          - Create device
  DELETE /api/devices/:id      - Delete device
  GET    /api/alerts           - Get all alerts
  POST   /api/alerts           - Create alert
  PUT    /api/alerts/:id/ack   - Acknowledge alert
  GET    /api/tickets          - Get all tickets
  POST   /api/tickets          - Create ticket
  PUT    /api/tickets/:id      - Update ticket
  DELETE /api/tickets/:id      - Delete ticket
  `);
});