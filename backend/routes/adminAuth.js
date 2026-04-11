const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { z } = require('zod');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'AVARAN@ADMIN2026';

/**
 * Validation schemas
 */
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const adminRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  secretKey: z.string().min(1, 'Admin secret key is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Admin Authentication Middleware
 */
const protectAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * @route   POST /api/admin/auth/login
 * @desc    Admin login with email and password
 * @access  Public
 */
router.post('/auth/login', async (req, res) => {
  try {
    const parsed = adminLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { email, password } = parsed.data;

    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await admin.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (err) {
    console.error('Admin Login Error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @route   POST /api/admin/auth/register
 * @desc    Register a new admin account with secret key validation
 * @access  Public with secret key
 */
router.post('/auth/register', async (req, res) => {
  try {
    const parsed = adminRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { name, email, password, secretKey } = parsed.data;

    // Validate secret key
    if (secretKey !== ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: 'admin',
      permissions: ['view-claims', 'approve-claims', 'view-workers', 'view-analytics']
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (err) {
    console.error('Admin Register Error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * @route   GET /api/admin/auth/me
 * @desc    Get current admin profile
 * @access  Admin only
 */
router.get('/auth/me', protectAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Admin logout (mainly for frontend to clear token)
 * @access  Admin only
 */
router.post('/auth/logout', protectAdmin, (req, res) => {
  // Token is typically handled on frontend by deletion
  res.json({ message: 'Logout successful' });
});

module.exports = { router, protectAdmin };
