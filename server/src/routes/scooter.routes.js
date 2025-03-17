import express from 'express';
import { 
  getScooters, 
  getScooterById, 
  createScooter, 
  updateScooter, 
  deleteScooter, 
  getScooterMaintenanceLogs,
  getDashboardStats,
  getPublicAvailableScooters,
  getPublicScooterById
} from '../controllers/scooter.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public', getPublicAvailableScooters);
router.get('/public/:id', getPublicScooterById);

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get all scooters with optional filtering
router.get('/', getScooters);

// Get a single scooter by ID
router.get('/:id', getScooterById);

// Get maintenance logs for a specific scooter
router.get('/:id/maintenance-logs', getScooterMaintenanceLogs);

// Create a new scooter (admin only)
router.post('/', requireAdmin, createScooter);

// Update an existing scooter (admin only)
router.put('/:id', requireAdmin, updateScooter);

// Delete a scooter (admin only)
router.delete('/:id', requireAdmin, deleteScooter);

export default router;