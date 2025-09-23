const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    let user = await User.findOne({ email: email.toLowerCase() });

    // If user doesn't exist, create a demo user
    if (!user) {
      console.log('User not found, creating demo user for:', email);
      
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name: email.includes('admin') ? 'Admin User' : 'Demo User',
        email: email.toLowerCase(),
        password: hashedPassword,
        userType: userType || 'adopter',
        isVerified: true,
        phone: '(555) 123-4567',
        location: 'Austin, TX',
        bio: 'Demo user account'
      });
      
      await user.save();
      console.log('Demo user created successfully');
    } else {
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false, 
          message: 'Invalid credentials'
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        uid: user._id,
        email: user.email,
        userType: user.userType 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data
    const userData = {
      uid: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      userType: user.userType,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: {
        user: userData,
        token: token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/register  
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, location, bio, userType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      location: location || '',
      bio: bio || '',
      userType: userType || 'adopter',
      isVerified: true // Auto-verify for demo
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        uid: user._id,
        email: user.email,
        userType: user.userType 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data
    const userData = {
      uid: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      userType: user.userType,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      success: true,
      data: {
        user: userData,
        token: token
      },
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      uid: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      userType: user.userType,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;