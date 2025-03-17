// auth.middleware.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Replace with actual secret in production

/**
 * Middleware to authenticate JWT token
 * Used to protect routes that require authentication
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Check for token in cookies first (for web browsers)
    let token = req.cookies.token;
    
    // If no token in cookies, check Authorization header (for API clients)
    if (!token) {
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.split(' ')[1]; // Get token from Bearer header
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      // Attach user info to request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};

/**
 * Middleware to ensure user is an admin
 * Used to protect admin-only routes
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

/**
 * Middleware to ensure user is verified
 * Used to protect routes that require verified users
 */
export const requireVerifiedUser = async (req, res, next) => {
  try {
    const { userId } = req.user;
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'VERIFIED') {
      return res.status(403).json({ message: 'Account pending verification' });
    }

    next();
  } catch (error) {
    console.error('Verification check error:', error);
    return res.status(500).json({ message: 'Verification check failed', error: error.message });
  }
};