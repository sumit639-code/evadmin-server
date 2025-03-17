import express from 'express';
import { 
  getRentals, 
  getRentalById, 
  createRental, 
  completeRental, 
  cancelRental,
  getRentalStats
} from '../controllers/rental.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get rental statistics (admin only)
router.get('/stats', requireAdmin, getRentalStats);

// Get all rentals
// Regular users will only see their own rentals (handled in controller)
router.get('/', getRentals);

// Get a single rental by ID
router.get('/:id', getRentalById);

// Create a new rental
router.post('/', createRental);

// Complete a rental
router.put('/:id/complete', completeRental);

// Cancel a rental
router.put('/:id/cancel', cancelRental);

export default router;