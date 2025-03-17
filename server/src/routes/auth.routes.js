import express from "express";
import {
  registerUser,
  loginUser,
  registerAdmin,
  verifyUser,
  createInitialAdmin,
  getCurrentUser,
  logoutUser
} from "../controllers/auth.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";
import { getPendingUsers } from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// One-time setup route (should be disabled in production after first use)
router.post("/setup-admin", createInitialAdmin);

// Protected routes
router.get("/profile", authenticateToken, getCurrentUser);

// Admin-only routes
router.post("/register-admin", authenticateToken, requireAdmin, registerAdmin);
router.patch("/verify-user/:userId", authenticateToken, requireAdmin, verifyUser);

// Get all pending users (for admin verification page)
router.get("/pending-users", authenticateToken, requireAdmin, getPendingUsers);

export default router;