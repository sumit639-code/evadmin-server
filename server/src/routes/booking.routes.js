// bookingRoutes.js
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';
import * as bookingController from '../controllers/booking.controller.js';

const router = express.Router();

router.get('/available-slots', bookingController.checkAvailableTimeSlots);

// Get all bookings with pagination and filtering
router.get('/', authenticateToken, bookingController.getAllBookings);

// Get booking by ID
router.get('/:id', authenticateToken, bookingController.getBookingById);

// Create a new booking
router.post('/', authenticateToken, bookingController.createBooking);

// Update booking status
router.patch('/:id/status', authenticateToken, bookingController.updateBookingStatus);

// Delete a booking (admin only)
router.delete('/:id', authenticateToken, requireAdmin, bookingController.deleteBooking);

// Get booking statistics
router.get('/stats', authenticateToken, requireAdmin, bookingController.getBookingStats);

// Export bookings data
router.get('/export', authenticateToken, requireAdmin, bookingController.exportBookings);

export default router;