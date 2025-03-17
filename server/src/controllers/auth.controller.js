// auth.controller.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Environment variables (stored in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Replace with actual secret in production
const JWT_EXPIRES_IN = '24h';
const COOKIE_EXPIRES = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * User Registration Controller
 * Registers new regular users (not admins)
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (role defaults to USER in schema)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        status: 'VERIFIED' // Needs verification by admin
      }
    });

    // Don't return the password in response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Registration successful! Your account is pending verification.',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * User Login Controller
 * Handles login for both regular users and admins
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For regular users, check if they are verified
    if (user.role === 'USER' && user.status === 'PENDING') {
      return res.status(403).json({ message: 'Your account is pending verification' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'strict',
      maxAge: COOKIE_EXPIRES
    });

    // Don't return the password in response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token, // Also include token in response for client-side storage if needed
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

/**
 * User Logout Controller
 */
// In your auth.controller.js
export const logoutUser = async (req, res) => {
  try {
    // Clear the cookie - make sure the options match how you set it
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // You might need to add path if you specified it when setting
      path: '/' // Add this if your cookie has a path
    });

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};
/**
 * Admin Registration Controller
 * Only existing admins can create new admin accounts
 */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'VERIFIED' // Admins are automatically verified
      }
    });

    // Don't return the password in response
    const { password: _, ...adminWithoutPassword } = newAdmin;

    return res.status(201).json({
      message: 'Admin registration successful',
      user: adminWithoutPassword
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * Verify User Controller
 * Allows admins to verify pending user accounts
 */
export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user status to VERIFIED
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'VERIFIED' }
    });

    // Don't return the password in response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: 'User verified successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('User verification error:', error);
    return res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

/**
 * Get Pending Users Controller
 * Retrieves all users with PENDING status for admin verification
 */
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { 
        status: 'PENDING',
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true
      }
    });

    return res.status(200).json({
      pendingUsers
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    return res.status(500).json({ message: 'Failed to retrieve pending users', error: error.message });
  }
};

/**
 * Create Initial Admin Account
 * Used once during system setup to create the first admin
 * This should be protected or removed in production
 */
export const createInitialAdmin = async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin account already exists' });
    }

    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create initial admin
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'VERIFIED'
      }
    });

    // Don't return the password in response
    const { password: _, ...adminWithoutPassword } = admin;

    return res.status(201).json({
      message: 'Initial admin account created successfully',
      user: adminWithoutPassword
    });
  } catch (error) {
    console.error('Initial admin creation error:', error);
    return res.status(500).json({ message: 'Admin creation failed', error: error.message });
  }
};

/**
 * Get Current User Profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Failed to retrieve user profile', error: error.message });
  }
};