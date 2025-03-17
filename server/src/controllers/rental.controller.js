import { PrismaClient } from '@prisma/client';
import { calculateDuration, calculateAmount } from '../utils/rentalUtils.js';

const prisma = new PrismaClient();

/**
 * Get all rentals with optional filtering
 */
export const getRentals = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, userId, scooterId, startDate, endDate } = req.query;
    
    // Build where condition for filtering
    const whereCondition = {};
    
    // Filter by status if provided
    if (status && status !== 'All') {
      // Convert UI status format to database enum format
      const statusMapping = {
        'Completed': 'COMPLETED',
        'In Progress': 'IN_PROGRESS',
        'Cancelled': 'CANCELLED'
      };
      
      whereCondition.status = statusMapping[status];
    }
    
    // Filter by user if provided
    if (userId) {
      whereCondition.userId = userId;
    }
    
    // Filter by scooter if provided
    if (scooterId) {
      whereCondition.scooterId = scooterId;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      whereCondition.startTime = {};
      
      if (startDate) {
        whereCondition.startTime.gte = new Date(startDate);
      }
      
      if (endDate) {
        whereCondition.startTime.lte = new Date(endDate);
      }
    }
    
    // Fetch rentals based on filters
    const rentals = await prisma.rental.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        scooter: {
          select: {
            id: true,
            scooterId: true,
            model: true,
            pricePerHour: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Format rentals for UI
    const formattedRentals = rentals.map(rental => {
      // Convert database status enum to UI format
      const statusMapping = {
        'COMPLETED': 'Completed',
        'IN_PROGRESS': 'In Progress',
        'CANCELLED': 'Cancelled'
      };

      // Calculate duration in user-friendly format
      const duration = calculateDuration(rental.startTime, rental.endTime);
      
      return {
        id: rental.id,
        riderName: rental.user.name,
        riderEmail: rental.user.email,
        scooterId: rental.scooter.scooterId,
        scooterModel: rental.scooter.model,
        startTime: rental.startTime,
        endTime: rental.endTime,
        duration: duration,
        amount: rental.amount,
        status: statusMapping[rental.status] || rental.status
      };
    });

    return res.status(200).json({
      rentals: formattedRentals,
      totalCount: formattedRentals.length
    });
  } catch (error) {
    console.error('Get rentals error:', error);
    return res.status(500).json({ message: 'Failed to retrieve rentals', error: error.message });
  }
};

/**
 * Get a single rental by ID
 */
export const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rental = await prisma.rental.findUnique({
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
        scooter: {
          select: {
            id: true,
            scooterId: true,
            model: true,
            pricePerHour: true
          }
        },
        transactions: true
      }
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Convert database status enum to UI format
    const statusMapping = {
      'COMPLETED': 'Completed',
      'IN_PROGRESS': 'In Progress',
      'CANCELLED': 'Cancelled'
    };

    // Calculate duration in user-friendly format
    const duration = calculateDuration(rental.startTime, rental.endTime);

    const formattedRental = {
      id: rental.id,
      riderName: rental.user.name,
      riderEmail: rental.user.email,
      riderPhone: rental.user.phone,
      scooterId: rental.scooter.scooterId,
      scooterModel: rental.scooter.model,
      pricePerHour: rental.scooter.pricePerHour,
      startTime: rental.startTime,
      endTime: rental.endTime,
      duration: duration,
      amount: rental.amount,
      status: statusMapping[rental.status] || rental.status,
      transactions: rental.transactions
    };

    return res.status(200).json({
      rental: formattedRental
    });
  } catch (error) {
    console.error('Get rental error:', error);
    return res.status(500).json({ message: 'Failed to retrieve rental', error: error.message });
  }
};

/**
 * Create a new rental
 */
export const createRental = async (req, res) => {
  try {
    const { userId, scooterId, startTime } = req.body;
    
    // Validate required fields
    if (!userId || !scooterId || !startTime) {
      return res.status(400).json({ message: 'User ID, Scooter ID, and Start Time are required fields' });
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

    if (scooter.status !== 'ON_ROAD' && scooter.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Scooter is not available for rent' });
    }

    // Create new rental
    const newRental = await prisma.rental.create({
      data: {
        userId,
        scooterId,
        startTime: new Date(startTime),
        status: 'IN_PROGRESS'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        scooter: {
          select: {
            id: true,
            scooterId: true,
            model: true,
            pricePerHour: true
          }
        }
      }
    });

    // Update scooter status to RENTED
    await prisma.scooter.update({
      where: { id: scooterId },
      data: { status: 'ON_ROAD' }
    });

    // Format response
    const statusMapping = {
      'IN_PROGRESS': 'In Progress'
    };

    const formattedRental = {
      id: newRental.id,
      riderName: newRental.user.name,
      scooterId: newRental.scooter.scooterId,
      scooterModel: newRental.scooter.model,
      startTime: newRental.startTime,
      status: statusMapping[newRental.status] || newRental.status
    };

    return res.status(201).json({
      message: 'Rental created successfully',
      rental: formattedRental
    });
  } catch (error) {
    console.error('Create rental error:', error);
    return res.status(500).json({ message: 'Failed to create rental', error: error.message });
  }
};

/**
 * Complete a rental
 */
export const completeRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime } = req.body;
    
    if (!endTime) {
      return res.status(400).json({ message: 'End Time is required' });
    }

    // Get the rental
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        scooter: true
      }
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Only active rentals can be completed' });
    }

    const endTimeDate = new Date(endTime);
    
    // Calculate duration and amount
    const durationInHours = (endTimeDate - rental.startTime) / (1000 * 60 * 60);
    const amount = calculateAmount(durationInHours, rental.scooter.pricePerHour);

    // Update rental
    const updatedRental = await prisma.rental.update({
      where: { id },
      data: {
        endTime: endTimeDate,
        duration: durationInHours.toFixed(2) + ' hours',
        amount,
        status: 'COMPLETED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        scooter: {
          select: {
            id: true,
            scooterId: true,
            model: true,
            pricePerHour: true
          }
        }
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: rental.userId,
        rentalId: rental.id,
        amount,
        date: new Date(),
        type: 'RIDE_PAYMENT',
        status: 'COMPLETED'
      }
    });

    // Update scooter status to AVAILABLE
    await prisma.scooter.update({
      where: { id: rental.scooterId },
      data: { status: 'AVAILABLE' }
    });

    // Format response
    const statusMapping = {
      'COMPLETED': 'Completed'
    };

    const formattedRental = {
      id: updatedRental.id,
      riderName: updatedRental.user.name,
      scooterId: updatedRental.scooter.scooterId,
      scooterModel: updatedRental.scooter.model,
      startTime: updatedRental.startTime,
      endTime: updatedRental.endTime,
      duration: updatedRental.duration,
      amount: updatedRental.amount,
      status: statusMapping[updatedRental.status] || updatedRental.status
    };

    return res.status(200).json({
      message: 'Rental completed successfully',
      rental: formattedRental
    });
  } catch (error) {
    console.error('Complete rental error:', error);
    return res.status(500).json({ message: 'Failed to complete rental', error: error.message });
  }
};

/**
 * Cancel a rental
 */
export const cancelRental = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the rental
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        scooter: true
      }
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Only active rentals can be cancelled' });
    }

    // Update rental
    const updatedRental = await prisma.rental.update({
      where: { id },
      data: {
        endTime: new Date(),
        status: 'CANCELLED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        scooter: {
          select: {
            id: true,
            scooterId: true,
            model: true
          }
        }
      }
    });

    // Update scooter status to AVAILABLE
    await prisma.scooter.update({
      where: { id: rental.scooterId },
      data: { status: 'AVAILABLE' }
    });

    // Format response
    const statusMapping = {
      'CANCELLED': 'Cancelled'
    };

    const formattedRental = {
      id: updatedRental.id,
      riderName: updatedRental.user.name,
      scooterId: updatedRental.scooter.scooterId,
      scooterModel: updatedRental.scooter.model,
      startTime: updatedRental.startTime,
      endTime: updatedRental.endTime,
      status: statusMapping[updatedRental.status] || updatedRental.status
    };

    return res.status(200).json({
      message: 'Rental cancelled successfully',
      rental: formattedRental
    });
  } catch (error) {
    console.error('Cancel rental error:', error);
    return res.status(500).json({ message: 'Failed to cancel rental', error: error.message });
  }
};

/**
 * Get rental statistics
 */
export const getRentalStats = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get stats for today
    const todayStats = await prisma.$transaction([
      // Total rentals today
      prisma.rental.count({
        where: {
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      // Completed rentals today
      prisma.rental.count({
        where: {
          status: 'COMPLETED',
          endTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      // Active rentals
      prisma.rental.count({
        where: {
          status: 'IN_PROGRESS'
        }
      }),
      // Total revenue today
      prisma.transaction.aggregate({
        where: {
          type: 'RIDE_PAYMENT',
          status: 'COMPLETED',
          date: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);
    
    // Get stats for all time
    const allTimeStats = await prisma.$transaction([
      // Total rentals all time
      prisma.rental.count(),
      // Average rental duration
      prisma.rental.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _avg: {
          amount: true
        }
      })
    ]);
    
    const stats = {
      today: {
        totalRentals: todayStats[0],
        completedRentals: todayStats[1],
        activeRentals: todayStats[2],
        revenue: todayStats[3]._sum.amount || 0
      },
      allTime: {
        totalRentals: allTimeStats[0],
        averageAmount: allTimeStats[1]._avg.amount || 0
      }
    };
    
    return res.status(200).json({ stats });
  } catch (error) {
    console.error('Get rental stats error:', error);
    return res.status(500).json({ message: 'Failed to retrieve rental statistics', error: error.message });
  }
};