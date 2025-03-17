// controllers/adminDashboard.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Get dashboard statistics overview
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Execute all queries in parallel for better performance
    const [
      totalUsers,
      totalScooters,
      totalRentals,
      totalRevenue,
      activeRentals,
      pendingUsers,
      scootersInMaintenance,
      pendingTransactions
    ] = await Promise.all([
      // Count total users
      prisma.user.count(),
      
      // Count total scooters
      prisma.scooter.count(),
      
      // Count total rentals
      prisma.rental.count(),
      
      // Sum all completed transaction amounts
      prisma.transaction.aggregate({
        where: { 
          status: 'COMPLETED',
          type: 'RIDE_PAYMENT' 
        },
        _sum: {
          amount: true
        }
      }),
      
      // Count active rentals
      prisma.rental.count({
        where: { status: 'IN_PROGRESS' }
      }),
      
      // Count pending users
      prisma.user.count({
        where: { status: 'PENDING' }
      }),
      
      // Count scooters in maintenance
      prisma.scooter.count({
        where: { status: 'IN_MAINTENANCE' }
      }),
      
      // Count pending transactions
      prisma.transaction.count({
        where: { status: 'PENDING' }
      })
    ]);

    // Prepare response object
    const stats = {
      totalUsers,
      totalScooters,
      totalRentals,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeRentals,
      pendingUsers,
      scootersInMaintenance,
      pendingTransactions
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

/**
 * Get revenue and expenses summary for a date range
 */
export const getRevenueSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Query revenue data
    const revenues = await prisma.revenue.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      select: {
        date: true,
        amount: true
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Query expense data
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      select: {
        date: true,
        amount: true
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Combine revenue and expense data by date
    const dateMap = new Map();
    
    // Process revenues
    revenues.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, revenue: 0, expenses: 0 });
      }
      
      dateMap.get(dateStr).revenue += item.amount;
    });
    
    // Process expenses
    expenses.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, revenue: 0, expenses: 0 });
      }
      
      dateMap.get(dateStr).expenses += item.amount;
    });
    
    // Convert map to array and sort by date
    const result = Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    return res.status(500).json({ error: 'Failed to fetch revenue summary' });
  }
};

/**
 * Get scooter status summary
 */
export const getScooterStatusSummary = async (req, res) => {
  try {
    // Count scooters by status
    const statusSummary = await prisma.scooter.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    // Transform the result
    const result = statusSummary.map(item => ({
      status: item.status,
      count: item._count.id
    }));
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching scooter status summary:', error);
    return res.status(500).json({ error: 'Failed to fetch scooter status summary' });
  }
};

/**
 * Get rental summary for a date range
 */
export const getRentalSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Group rentals by date and status
    const rentalData = await prisma.$queryRaw`
      SELECT 
        DATE(r."createdAt") as date,
        r.status,
        COUNT(*) as count
      FROM "Rental" r
      WHERE r."createdAt" >= ${start} AND r."createdAt" <= ${end}
      GROUP BY DATE(r."createdAt"), r.status
      ORDER BY date ASC
    `;
    
    // Transform the result into the expected format
    const dateMap = new Map();
    
    rentalData.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { 
          date: dateStr, 
          completed: 0, 
          cancelled: 0, 
          inProgress: 0 
        });
      }
      
      const entry = dateMap.get(dateStr);
      
      if (item.status === 'COMPLETED') {
        entry.completed = parseInt(item.count);
      } else if (item.status === 'CANCELLED') {
        entry.cancelled = parseInt(item.count);
      } else if (item.status === 'IN_PROGRESS') {
        entry.inProgress = parseInt(item.count);
      }
    });
    
    // Convert map to array and sort by date
    const result = Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching rental summary:', error);
    return res.status(500).json({ error: 'Failed to fetch rental summary' });
  }
};

/**
 * Get user activity for a date range
 */
export const getUserActivity = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Query for new users by date
    const newUsersData = await prisma.$queryRaw`
      SELECT 
        DATE(u."createdAt") as date,
        COUNT(*) as count
      FROM "User" u
      WHERE u."createdAt" >= ${start} AND u."createdAt" <= ${end}
      GROUP BY DATE(u."createdAt")
      ORDER BY date ASC
    `;
    
    // Query for active users (users with rentals or transactions) by date
    const activeUsersData = await prisma.$queryRaw`
      SELECT 
        DATE(r."createdAt") as date,
        COUNT(DISTINCT r."userId") as count
      FROM "Rental" r
      WHERE r."createdAt" >= ${start} AND r."createdAt" <= ${end}
      GROUP BY DATE(r."createdAt")
      ORDER BY date ASC
    `;
    
    // Combine the data
    const dateMap = new Map();
    
    // Process new users data
    newUsersData.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, newUsers: 0, activeUsers: 0 });
      }
      
      dateMap.get(dateStr).newUsers = parseInt(item.count);
    });
    
    // Process active users data
    activeUsersData.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, newUsers: 0, activeUsers: 0 });
      }
      
      dateMap.get(dateStr).activeUsers = parseInt(item.count);
    });
    
    // Convert map to array and sort by date
    const result = Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return res.status(500).json({ error: 'Failed to fetch user activity' });
  }
};