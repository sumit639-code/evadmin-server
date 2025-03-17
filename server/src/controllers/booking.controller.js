// bookingController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all rentals (bookings) with pagination and filtering options
 */
export const getAllBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId, 
      scooterId,
      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (page - 1) * parseInt(limit);
    
    // Build filter conditions
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (scooterId) {
      where.scooterId = scooterId;
    }
    
    // Date filtering for startTime
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    // Build sorting options
    const orderBy = {};
    orderBy[sortBy] = sortOrder.toLowerCase();
    
    // Get bookings with pagination
    const bookings = await prisma.rental.findMany({
      skip,
      take: parseInt(limit),
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        scooter: {
          select: {
            id: true,
            scooterId: true,
            model: true,
            pricePerHour: true,
            pricePerDay: true
          }
        },
        transactions: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true,
            amount: true,
            type: true,
            date: true
          }
        }
      },
      orderBy
    });
    
    // Get total count for pagination
    const total = await prisma.rental.count({ where });
    
    // Get booking statistics
    const completedBookings = await prisma.rental.count({
      where: {
        ...where,
        status: 'COMPLETED'
      }
    });
    
    const inProgressBookings = await prisma.rental.count({
      where: {
        ...where,
        status: 'IN_PROGRESS'
      }
    });
    
    const cancelledBookings = await prisma.rental.count({
      where: {
        ...where,
        status: 'CANCELLED'
      }
    });
    
    // Calculate total revenue from these bookings
    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        rentalId: {
          in: bookings.map(booking => booking.id)
        },
        status: 'COMPLETED',
        type: 'RIDE_PAYMENT'
      },
      _sum: {
        amount: true
      }
    });
    
    return res.status(200).json({
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        completed: completedBookings,
        inProgress: inProgressBookings,
        cancelled: cancelledBookings,
        totalRevenue: totalRevenue._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    return res.status(500).json({ message: 'Failed to get bookings', error: error.message });
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.rental.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        scooter: true,
        transactions: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error getting booking:', error);
    return res.status(500).json({ message: 'Failed to get booking', error: error.message });
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be IN_PROGRESS, COMPLETED, or CANCELLED' });
    }
    
    // Find booking
    const booking = await prisma.rental.findUnique({
      where: { id },
      include: {
        scooter: true
      }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Update booking status
    const updatedBooking = await prisma.rental.update({
      where: { id },
      data: { 
        status,
        // If marking as COMPLETED, set endTime if not already set
        ...(status === 'COMPLETED' && !booking.endTime ? { endTime: new Date() } : {})
      }
    });
    
    // If status is COMPLETED, update scooter status to AVAILABLE
    if (status === 'COMPLETED' && booking.scooter.status === 'ON_ROAD') {
      await prisma.scooter.update({
        where: { id: booking.scooterId },
        data: { status: 'AVAILABLE' }
      });
    }
    
    // If status is CANCELLED, update scooter status to AVAILABLE
    if (status === 'CANCELLED' && booking.scooter.status === 'ON_ROAD') {
      await prisma.scooter.update({
        where: { id: booking.scooterId },
        data: { status: 'AVAILABLE' }
      });
    }
    
    return res.status(200).json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ message: 'Failed to update booking status', error: error.message });
  }
};

/**
 * Create a new rental/booking
 */
export const createBooking = async (req, res) => {
  try {
    const { userId, scooterId, startTime, duration } = req.body;
    
    // Validate required fields
    if (!userId || !scooterId || !startTime) {
      return res.status(400).json({ message: 'User ID, scooter ID, and start time are required' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if scooter exists and is available
    const scooter = await prisma.scooter.findUnique({
      where: { id: scooterId }
    });
    
    if (!scooter) {
      return res.status(404).json({ message: 'Scooter not found' });
    }
    
    if (scooter.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Scooter is not available for rental' });
    }
    
    // Create new rental/booking
    const newBooking = await prisma.rental.create({
      data: {
        userId,
        scooterId,
        startTime: new Date(startTime),
        duration: duration || null,
        status: 'IN_PROGRESS'
      }
    });
    
    // Update scooter status to ON_ROAD
    await prisma.scooter.update({
      where: { id: scooterId },
      data: { status: 'ON_ROAD' }
    });
    
    return res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

/**
 * Delete a booking (admin only)
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if booking exists
    const booking = await prisma.rental.findUnique({
      where: { id },
      include: {
        transactions: true
      }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking has transactions
    if (booking.transactions.length > 0) {
      // Can't delete booking with transactions - need to preserve financial records
      return res.status(400).json({ 
        message: 'Cannot delete booking with associated transactions. Mark as cancelled instead.'
      });
    }
    
    // Delete booking
    await prisma.rental.delete({
      where: { id }
    });
    
    // Update scooter status if it was on road for this booking
    if (booking.status === 'IN_PROGRESS') {
      await prisma.scooter.update({
        where: { id: booking.scooterId },
        data: { status: 'AVAILABLE' }
      });
    }
    
    return res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ message: 'Failed to delete booking', error: error.message });
  }
};

/**
 * Get booking statistics
 */
export const getBookingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.startTime = {};
      if (startDate) {
        dateFilter.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.startTime.lte = new Date(endDate);
      }
    }
    
    // Get overall stats
    const totalBookings = await prisma.rental.count({
      where: dateFilter
    });
    
    const statusCounts = await prisma.rental.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: {
        status: true
      }
    });
    
    // Format status counts
    const formattedStatusCounts = {
      COMPLETED: 0,
      IN_PROGRESS: 0,
      CANCELLED: 0
    };
    
    statusCounts.forEach(item => {
      formattedStatusCounts[item.status] = item._count.status;
    });
    
    // Get popular scooters
    const popularScooters = await prisma.rental.groupBy({
      by: ['scooterId'],
      where: {
        ...dateFilter,
        status: {
          in: ['COMPLETED', 'IN_PROGRESS']
        }
      },
      _count: {
        scooterId: true
      },
      orderBy: {
        _count: {
          scooterId: 'desc'
        }
      },
      take: 5
    });
    
    // Get scooter details
    const scooterIds = popularScooters.map(item => item.scooterId);
    const scooterDetails = await prisma.scooter.findMany({
      where: {
        id: {
          in: scooterIds
        }
      },
      select: {
        id: true,
        scooterId: true,
        model: true
      }
    });
    
    // Map counts to scooter details
    const topScooters = scooterIds.map(id => {
      const scooter = scooterDetails.find(s => s.id === id);
      const countData = popularScooters.find(p => p.scooterId === id);
      return {
        ...scooter,
        bookingCount: countData ? countData._count.scooterId : 0
      };
    }).sort((a, b) => b.bookingCount - a.bookingCount);
    
    // Get average rental duration
    const completedRentals = await prisma.rental.findMany({
      where: {
        ...dateFilter,
        status: 'COMPLETED',
        endTime: {
          not: null
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });
    
    let totalDurationHours = 0;
    
    completedRentals.forEach(rental => {
      const durationMs = new Date(rental.endTime) - new Date(rental.startTime);
      const durationHours = durationMs / (1000 * 60 * 60);
      totalDurationHours += durationHours;
    });
    
    const averageDurationHours = completedRentals.length > 0 
      ? totalDurationHours / completedRentals.length 
      : 0;
    
    return res.status(200).json({
      totalBookings,
      statusCounts: formattedStatusCounts,
      topScooters,
      averageDurationHours: parseFloat(averageDurationHours.toFixed(2)),
      completedCount: formattedStatusCounts.COMPLETED || 0,
      cancellationRate: totalBookings > 0 
        ? parseFloat(((formattedStatusCounts.CANCELLED || 0) / totalBookings * 100).toFixed(2)) 
        : 0
    });
  } catch (error) {
    console.error('Error getting booking stats:', error);
    return res.status(500).json({ message: 'Failed to get booking statistics', error: error.message });
  }
};

/**
 * Export bookings data
 */
export const exportBookings = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, status } = req.query;
    
    // Build filter conditions
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    // Date filtering
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }
    
    // Get bookings
    const bookings = await prisma.rental.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        scooter: {
          select: {
            scooterId: true,
            model: true
          }
        },
        transactions: {
          where: {
            status: 'COMPLETED',
            type: 'RIDE_PAYMENT'
          },
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });
    
    // Format data for export
    const formattedData = bookings.map(booking => {
      // Calculate total amount from transactions
      const totalAmount = booking.transactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        id: booking.id,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime ? booking.endTime.toISOString() : 'N/A',
        status: booking.status,
        duration: booking.duration || 'N/A',
        userName: booking.user.name,
        userEmail: booking.user.email,
        userPhone: booking.user.phone,
        scooterId: booking.scooter.scooterId,
        scooterModel: booking.scooter.model,
        amount: totalAmount > 0 ? totalAmount : 'N/A'
      };
    });
    
    if (format.toLowerCase() === 'csv') {
      // Generate CSV content
      const csvHeader = 'ID,Start Time,End Time,Status,Duration,User Name,User Email,User Phone,Scooter ID,Scooter Model,Amount\n';
      const csvRows = formattedData.map(data => 
        `${data.id},${data.startTime},${data.endTime},${data.status},${data.duration},${data.userName},${data.userEmail},${data.userPhone},${data.scooterId},${data.scooterModel},${data.amount}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings-data.csv');
      return res.send(csvContent);
    } else {
      // Return as JSON
      return res.status(200).json({
        data: formattedData,
        count: formattedData.length,
        exportedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error exporting bookings:', error);
    return res.status(500).json({ message: 'Failed to export bookings', error: error.message });
  }
};


/**
 * Check for available time slots for a scooter
 * This is a public endpoint to help users plan their booking
 */
export const checkAvailableTimeSlots = async (req, res) => {
  try {
    const { scooterId, date } = req.query;
    
    if (!scooterId || !date) {
      return res.status(400).json({ message: 'Scooter ID and date are required' });
    }
    
    // Check if scooter exists and is available
    const scooter = await prisma.scooter.findUnique({
      where: { id: scooterId }
    });
    
    if (!scooter) {
      return res.status(404).json({ message: 'Scooter not found' });
    }
    
    if (scooter.status !== 'AVAILABLE') {
      return res.status(400).json({ 
        message: 'Scooter is not available for booking',
        status: scooter.status
      });
    }
    
    // Parse date
    const requestedDate = new Date(date);
    
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Set start and end of the requested day
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get all bookings for the scooter on the requested day
    const bookings = await prisma.rental.findMany({
      where: {
        scooterId,
        status: 'IN_PROGRESS',
        OR: [
          {
            // Booking starts on the requested day
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            // Booking ends on the requested day
            endTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            // Booking spans the requested day
            AND: [
              {
                startTime: {
                  lte: startOfDay,
                },
              },
              {
                endTime: {
                  gte: endOfDay,
                },
              },
            ],
          },
        ],
      },
      orderBy: { startTime: 'asc' },
    });
    
    // Generate available time slots
    const bookedSlots = bookings.map(booking => ({
      start: booking.startTime,
      end: booking.endTime,
    }));
    
    return res.status(200).json({
      scooter: {
        id: scooter.id,
        model: scooter.model,
        pricePerHour: scooter.pricePerHour,
        pricePerDay: scooter.pricePerDay,
      },
      date: requestedDate.toISOString().split('T')[0],
      bookedSlots,
    });
  } catch (error) {
    console.error('Check available time slots error:', error);
    return res.status(500).json({ message: 'Failed to check availability', error: error.message });
  }
};