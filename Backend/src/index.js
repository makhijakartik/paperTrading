require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { RedisStore } = require('connect-redis');

// Import DB and Redis configurations to initialize connections on startup
const db = require('./config/db');
const redisClient = require('./config/redis');

// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow React frontend (when we build it)
  credentials: true // Allow cookies to be sent across origins
}));
app.use(express.json()); // Parse incoming JSON payloads

// Session Setup with Redis
// We initialize the store with our existing redisClient
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'session:',
});

app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: false, // Set to true if using HTTPS in production
    httpOnly: true, // Prevents client-side JS from reading the cookie
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Routes
app.use('/api/auth', authRoutes);

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'up', 
    message: 'PaperMoney API is running smoothly' 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
