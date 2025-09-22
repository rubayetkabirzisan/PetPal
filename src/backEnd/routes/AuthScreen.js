const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'petpal_secret_key_change_in_production';

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'adopter',
      address,
      dateOfBirth,
      occupation,
      emergencyContact
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim(),
      role,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      occupation: occupation?.trim(),
      emergencyContact,
      profile: {
        isComplete: false,
        completedSteps: ['basic_info']
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profileVisible: true,
          contactInfoVisible: false
        }
      },
      verification: {
        email: {
          isVerified: false,
          token: this.generateVerificationToken(),
          sentAt: new Date()
        }
      },
      createdAt: new Date()
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: savedUser._id, 
        email: savedUser.email,
        role: savedUser.role 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Create welcome notification
    await Notification.create({
      userId: savedUser._id,
      type: 'system',
      title: 'Welcome to PetPal!',
      message: 'Welcome to PetPal! Complete your profile to start finding your perfect pet companion.',
      data: {
        action: 'complete_profile',
        priority: 'medium'
      }
    });

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.verification;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        expiresIn: '30d'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to generate verification token
function generateVerificationToken() {
  return Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
}

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Update failed login attempts
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'security.failedLoginAttempts': 1 },
        $set: { 'security.lastFailedLogin': new Date() }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset failed login attempts on successful login
    await User.findByIdAndUpdate(user._id, {
      $unset: { 'security.failedLoginAttempts': 1 },
      $set: { 
        'security.lastLogin': new Date(),
        'security.lastLoginIP': req.ip || req.connection.remoteAddress
      }
    });

    // Generate JWT token
    const expiresIn = rememberMe ? '90d' : '30d';
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn }
    );

    // Remove sensitive data from response
    delete user.password;
    delete user.verification;
    delete user.security;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
        expiresIn
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      'verification.passwordReset': {
        token: resetToken,
        expires: resetExpires,
        requestedAt: new Date()
      }
    });

    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      // In development, include token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      'verification.passwordReset.token': token,
      'verification.passwordReset.expires': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and remove reset token
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      $unset: { 'verification.passwordReset': 1 },
      'security.passwordChangedAt': new Date()
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// POST /api/auth/change-password - Change password (authenticated)
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    if (!currentPassword || !newPassword || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and user ID are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      'security.passwordChangedAt': new Date()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// POST /api/auth/verify-token - Verify JWT token validity
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.userId)
        .select('-password -verification -security');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Account is suspended'
        });
      }

      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user,
          tokenExpiry: new Date(decoded.exp * 1000)
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify token'
    });
  }
});

// POST /api/auth/logout - Logout user (optional - mainly for tracking)
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId) {
      // Update last logout time
      await User.findByIdAndUpdate(userId, {
        'security.lastLogout': new Date()
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// GET /api/auth/profile/:userId - Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -verification')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;