// transactionController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all transactions with pagination
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    // Build filter conditions
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    // Date filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }
    
    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      skip,
      take: parseInt(limit),
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        rental: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Get total count for pagination
    const total = await prisma.transaction.count({ where });
    
    // Calculate totals for dashboard metrics
    const totalAmount = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: {
          in: ['RIDE_PAYMENT', 'BONUS']  // Include revenue-generating transactions
        }
      },
      _sum: {
        amount: true
      }
    });
    
    const pendingAmount = await prisma.transaction.aggregate({
      where: {
        status: 'PENDING'
      },
      _sum: {
        amount: true
      }
    });
    
    const totalOrders = await prisma.transaction.count({
      where: {
        type: 'RIDE_PAYMENT'
      }
    });
    
    return res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      metrics: {
        totalEarnings: totalAmount._sum.amount || 0,
        totalOrders,
        totalPending: pendingAmount._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return res.status(500).json({ message: 'Failed to get transactions', error: error.message });
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.transaction.findUnique({
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
        rental: {
          include: {
            scooter: true
          }
        }
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Error getting transaction:', error);
    return res.status(500).json({ message: 'Failed to get transaction', error: error.message });
  }
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be PENDING, COMPLETED, or FAILED' });
    }
    
    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { status }
    });
    
    // If transaction is for a rental and status is COMPLETED, mark the rental as COMPLETED
    if (updatedTransaction.rentalId && status === 'COMPLETED' && updatedTransaction.type === 'RIDE_PAYMENT') {
      await prisma.rental.update({
        where: { id: updatedTransaction.rentalId },
        data: { status: 'COMPLETED' }
      });
    }
    
    return res.status(200).json({
      message: 'Transaction status updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return res.status(500).json({ message: 'Failed to update transaction status', error: error.message });
  }
};

/**
 * Create a new transaction
 */
export const createTransaction = async (req, res) => {
  try {
    const { userId, rentalId, amount, type, status = 'PENDING' } = req.body;
    
    // Validate required fields
    if (!userId || !amount || !type) {
      return res.status(400).json({ message: 'User ID, amount, and type are required' });
    }
    
    // Validate type
    const validTypes = ['RIDE_PAYMENT', 'BONUS', 'FINE', 'REFUND'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if rental exists if rentalId is provided
    if (rentalId) {
      const rental = await prisma.rental.findUnique({
        where: { id: rentalId }
      });
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
    }
    
    // Create new transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        userId,
        rentalId,
        amount,
        date: new Date(),
        type,
        status
      }
    });
    
    return res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ message: 'Failed to create transaction', error: error.message });
  }
};

/**
 * Delete a transaction (admin only)
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Delete transaction
    await prisma.transaction.delete({
      where: { id }
    });
    
    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ message: 'Failed to delete transaction', error: error.message });
  }
};

/**
 * Get transaction statistics
 */
export const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }
    
    // Only apply date filter if at least one date is provided
    const where = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
    
    // Get statistics
    const stats = await prisma.$transaction([
      // Total revenue
      prisma.transaction.aggregate({
        where: {
          ...where,
          status: 'COMPLETED',
          type: {
            in: ['RIDE_PAYMENT', 'BONUS']
          }
        },
        _sum: { amount: true }
      }),
      
      // Total by type
      prisma.transaction.groupBy({
        by: ['type'],
        where: {
          ...where,
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      
      // Count by status
      prisma.transaction.groupBy({
        by: ['status'],
        where,
        _count: true
      })
    ]);
    
    return res.status(200).json({
      totalRevenue: stats[0]._sum.amount || 0,
      revenueByType: stats[1],
      countByStatus: stats[2]
    });
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    return res.status(500).json({ message: 'Failed to get transaction statistics', error: error.message });
  }
};