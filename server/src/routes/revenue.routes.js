// routes.js
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

// Import controllers

import * as revenueController from '../controllers/revenue.controller.js';

const router = express.Router();



// Revenue routes
router.get('/overview', authenticateToken, requireAdmin, revenueController.getRevenueOverview);
router.get('/detailed', authenticateToken, requireAdmin, revenueController.getDetailedRevenue);
router.post('/daily-stats', authenticateToken, requireAdmin, revenueController.updateDailyStats);
router.get('/analytics', authenticateToken, requireAdmin, revenueController.getRevenueAnalytics);
router.get('/export', authenticateToken, requireAdmin, revenueController.exportRevenueData);

export default router;