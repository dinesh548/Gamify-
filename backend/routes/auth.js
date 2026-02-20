const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// JSON fallback storage
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data directory:', error);
  }
};

ensureDataDir();

// Helper to get users from JSON
const getUsersFromJSON = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Helper to save users to JSON
const saveUsersToJSON = async (users) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(['student', 'admin', 'mentor', 'recruiter'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role = 'student' } = req.body;

    // Check MongoDB first, fallback to JSON
    let user;
    try {
      user = await User.findOne({ email });
    } catch {
      // MongoDB not available, check JSON
      const users = await getUsersFromJSON();
      user = users.find(u => u.email === email);
    }

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const userData = {
      email,
      password, // Will be hashed in pre-save hook if MongoDB, or manually if JSON
      name,
      role,
      xp: 0,
      level: 1,
      badges: [],
      streak: 0,
      skills: {
        DSA: { level: 0, xp: 0, accuracy: 0, attempts: 0 },
        ML: { level: 0, xp: 0, accuracy: 0, attempts: 0 },
        DBMS: { level: 0, xp: 0, accuracy: 0, attempts: 0 },
        Aptitude: { level: 0, xp: 0, accuracy: 0, attempts: 0 },
        Frontend: { level: 0, xp: 0, accuracy: 0, attempts: 0 },
        Backend: { level: 0, xp: 0, accuracy: 0, attempts: 0 }
      },
      gameHistory: [],
      employabilityScore: 0
    };

    try {
      user = await User.create(userData);
    } catch {
      // MongoDB not available, save to JSON
      const bcrypt = require('bcryptjs');
      userData.password = await bcrypt.hash(password, 10);
      userData._id = Date.now().toString();
      const users = await getUsersFromJSON();
      users.push(userData);
      await saveUsersToJSON(users);
      user = { ...userData };
      delete user.password; // Don't send password back
    }

    const token = jwt.sign(
      { userId: user._id || user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    let user;
    try {
      user = await User.findOne({ email });
      if (user && !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch {
      // MongoDB not available, check JSON
      const users = await getUsersFromJSON();
      user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id || user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    let user;
    try {
      user = await User.findById(req.user.userId).select('-password');
    } catch {
      const users = await getUsersFromJSON();
      user = users.find(u => (u._id || u.id) === req.user.userId);
      if (user) {
        delete user.password;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
