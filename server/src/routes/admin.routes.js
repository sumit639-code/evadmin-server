// routes/adminDashboard.routes.js
import express from 'express'
const router = express.Router();
import * as adminDashboardController from "../controllers/admin.controller.js"
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';


// Apply auth middleware to all routes to ensure only authenticated admins can access
router.use(authenticateToken)
router.use(requireAdmin)
// Dashboard main stats
router.get('/stats', adminDashboardController.getDashboardStats);

// These routes could also be in their respective route files (revenue.routes.js, etc.)
// but are included here for completeness
router.get('/revenue/summary', adminDashboardController.getRevenueSummary);
router.get('/scooter/status-summary', adminDashboardController.getScooterStatusSummary);
router.get('/rental/summary', adminDashboardController.getRentalSummary);
router.get('/user/activity', adminDashboardController.getUserActivity);
export default router;