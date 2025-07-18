const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, customerId, role, firstName, lastName } = req.body;

   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

   
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      customerId,
      role: role || 'User',
      firstName,
      lastName
    });

    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id,
        customerId: user.customerId,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

   
    const token = jwt.sign(
      { 
        userId: user._id,
        customerId: user.customerId,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available screens for current tenant
router.get('/me/screens', authenticateToken, async (req, res) => {
  try {
    const { customerId, role } = req.user;
    
    // Load registry from file
    const fs = require('fs');
    const path = require('path');
    const registryPath = path.join(__dirname, '../registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    // Get screens for current tenant
    let screens = registry[customerId] || [];


    
    res.json({ screens });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
