const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// In-Memory Fallback User Store (used if MongoDB service is offline)
const inMemoryUsers = [];

const generateToken = (id) => {
  return jwt.sign(
    { id: id.toString() },
    process.env.JWT_SECRET || 'lunar_landing_super_secret_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

// Helper with timeout fallback for DB queries
const withDbTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms)),
  ]);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, organization, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    let user;
    let hashedPassword;
    const isConnected = mongoose.connection.readyState === 1;
    let useFallback = !isConnected;

    if (isConnected) {
      try {
        const existingUser = await withDbTimeout(User.findOne({ email: email.toLowerCase() }));
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User already exists with this email',
          });
        }

        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);

        user = await withDbTimeout(
          User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            organization: organization || 'Lunar Research Center',
            role: role && ['user', 'admin'].includes(role) ? role : 'user',
          })
        );
      } catch (dbErr) {
        if (dbErr.code === 11000 || dbErr.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: dbErr.code === 11000 ? 'User already exists with this email' : dbErr.message,
          });
        }
        console.warn('[MongoDB Fallback] Mongo offline or timeout. Registering user in in-memory session store.');
        useFallback = true;
      }
    }

    if (useFallback) {
      const existingMemUser = inMemoryUsers.find((u) => u.email === email.toLowerCase());
      if (existingMemUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);

      user = {
        _id: `mem_usr_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        organization: organization || 'Lunar Research Center',
        role: role && ['user', 'admin'].includes(role) ? role : 'user',
        createdAt: new Date(),
      };
      inMemoryUsers.push(user);
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    let user;
    const isConnected = mongoose.connection.readyState === 1;
    let useFallback = !isConnected;

    if (isConnected) {
      try {
        user = await withDbTimeout(User.findOne({ email: email.toLowerCase() }));
      } catch (dbErr) {
        console.warn('[MongoDB Fallback] Checking in-memory user store.');
        useFallback = true;
      }
    }

    if (useFallback || (!user && inMemoryUsers.length > 0)) {
      user = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.inMemoryUsers = inMemoryUsers;
