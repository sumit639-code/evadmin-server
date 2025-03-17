// revenueController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get revenue overview data for dashboard
 */
export const getRevenueOverview = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate = new Date();
    const endDate = new Date();
    
    // Calculate the start date based on the requested period
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to week
    }
    
    // Get all completed transactions within the period
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Calculate total revenue (income) from ride payments and bonuses
    const revenue = transactions
      .filter(t => ['RIDE_PAYMENT', 'BONUS'].includes(t.type))
      .reduce((total, t) => total + t.amount, 0);
    
    // Calculate total expenses from refunds and maintenance costs
    const expenses = transactions
      .filter(t => t.type === 'REFUND')
      .reduce((total, t) => total + t.amount, 0);
    
    // Get maintenance expenses
    const maintenanceExpenses = await prisma.maintenanceLog.aggregate({
      where: {
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        cost: true
      }
    });
    
    const totalExpenses = expenses + (maintenanceExpenses._sum.cost || 0);
    
    // Calculate net profit
    const netProfit = revenue - totalExpenses;
    
    // Get daily data for charts
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Get revenue by transaction type
    const revenueByType = transactions.reduce((result, t) => {
      if (!result[t.type]) {
        result[t.type] = 0;
      }
      result[t.type] += t.amount;
      return result;
    }, {});
    
    return res.status(200).json({
      summary: {
        totalRevenue: revenue,
        totalExpenses,
        netProfit,
        period
      },
      dailyStats,
      revenueByType
    });
  } catch (error) {
    console.error('Error getting revenue overview:', error);
    return res.status(500).json({ message: 'Failed to get revenue overview', error: error.message });
  }
};

/**
 * Get detailed revenue data with transactions
 */
export const getDetailedRevenue = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      type 
    } = req.query;
    
    const skip = (page - 1) * parseInt(limit);
    
    // Build filter conditions
    const where = { status: 'COMPLETED' };
    
    if (type && type !== 'ALL') {
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
    
    // Get detailed transactions
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
        rental: {
          include: {
            scooter: {
              select: {
                model: true,
                scooterId: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Get total count
    const total = await prisma.transaction.count({ where });
    
    // Calculate summary statistics
    const summary = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true
      },
      _count: true
    });
    
    // Format summary data
    const typeSummary = {};
    summary.forEach(item => {
      typeSummary[item.type] = {
        total: item._sum.amount,
        count: item._count
      };
    });
    
    // Calculate grand total
    const grandTotal = summary.reduce((total, item) => {
      if (['RIDE_PAYMENT', 'BONUS'].includes(item.type)) {
        return total + item._sum.amount;
      }
      return total;
    }, 0);
    
    return res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      summary: {
        byType: typeSummary,
        grandTotal
      }
    });
  } catch (error) {
    console.error('Error getting detailed revenue:', error);
    return res.status(500).json({ message: 'Failed to get detailed revenue', error: error.message });
  }
};

/**
 * Update daily stats
 */
export const updateDailyStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if stats already exist for today
    const existingStats = await prisma.dailyStats.findUnique({
      where: {
        date: today
      }
    });
    
    // Get total revenue for today
    const todayRevenue = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: {
          in: ['RIDE_PAYMENT', 'BONUS']
        },
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Get expenses for today
    const todayExpenses = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: 'REFUND',
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Get maintenance expenses
    const maintenanceExpenses = await prisma.maintenanceLog.aggregate({
      where: {
        startDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        cost: true
      }
    });
    
    // Count new users registered today
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Count active users (users with rentals today)
    const activeUsers = await prisma.rental.groupBy({
      by: ['userId'],
      where: {
        startTime: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      _count: true
    });
    
    // Count completed rides
    const completedRides = await prisma.rental.count({
      where: {
        status: 'COMPLETED',
        endTime: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });
    
    const totalRevenue = todayRevenue._sum.amount || 0;
    const expenses = (todayExpenses._sum.amount || 0) + (maintenanceExpenses._sum.cost || 0);
    
    const statsData = {
      date: today,
      totalRevenue,
      income: totalRevenue,
      expenses,
      newUsers,
      activeUsers: activeUsers.length,
      completedRides
    };
    
    let stats;
    
    if (existingStats) {
      // Update existing stats
      stats = await prisma.dailyStats.update({
        where: { date: today },
        data: statsData
      });
    } else {
      // Create new stats
      stats = await prisma.dailyStats.create({
        data: statsData
      });
    }
    
    return res.status(200).json({
      message: 'Daily stats updated successfully',
      stats
    });
  } catch (error) {
    console.error('Error updating daily stats:', error);
    return res.status(500).json({ message: 'Failed to update daily stats', error: error.message });
  }
};

/**
 * Get revenue analytics with custom grouping
 */
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      groupBy = 'day' // day, week, month 
    } = req.query;
    
    // Validate date range
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Get all daily stats within the date range
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Group the data based on the groupBy parameter
    const groupedData = {};
    
    dailyStats.forEach(stat => {
      let key;
      
      if (groupBy === 'day') {
        key = stat.date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        // Get week number (ISO week)
        const date = new Date(stat.date);
        const jan1 = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil((((date - jan1) / 86400000) + jan1.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${week}`;
      } else if (groupBy === 'month') {
        key = `${stat.date.getFullYear()}-${(stat.date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          totalRevenue: 0,
          income: 0,
          expenses: 0,
          newUsers: 0,
          activeUsers: 0,
          completedRides: 0
        };
      }
      
      groupedData[key].totalRevenue += stat.totalRevenue;
      groupedData[key].income += stat.income;
      groupedData[key].expenses += stat.expenses;
      groupedData[key].newUsers += stat.newUsers;
      groupedData[key].activeUsers += stat.activeUsers;
      groupedData[key].completedRides += stat.completedRides;
    });
    
    // Convert to array and sort
    const result = Object.values(groupedData).sort((a, b) => a.period.localeCompare(b.period));
    
    return res.status(200).json({
      analytics: result,
      summary: {
        totalRevenue: result.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalExpenses: result.reduce((sum, item) => sum + item.expenses, 0),
        totalRides: result.reduce((sum, item) => sum + item.completedRides, 0),
        totalNewUsers: result.reduce((sum, item) => sum + item.newUsers, 0)
      }
    });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    return res.status(500).json({ message: 'Failed to get revenue analytics', error: error.message });
  }
};

/**
 * Export revenue data as CSV or JSON
 */
export const exportRevenueData = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }
    
    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        date: dateFilter
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        rental: {
          include: {
            scooter: {
              select: {
                model: true,
                scooterId: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Format data for export
    const formattedData = transactions.map(t => ({
      id: t.id,
      date: t.date.toISOString(),
      amount: t.amount,
      type: t.type,
      userName: t.user?.name || 'N/A',
      userEmail: t.user?.email || 'N/A',
      scooterModel: t.rental?.scooter?.model || 'N/A',
      scooterId: t.rental?.scooter?.scooterId || 'N/A',
      rentalStartTime: t.rental?.startTime || null,
      rentalEndTime: t.rental?.endTime || null,
    }));
    
    if (format.toLowerCase() === 'csv') {
      // Generate CSV content
      const csvHeader = 'ID,Date,Amount,Type,User Name,User Email,Scooter Model,Scooter ID,Rental Start,Rental End\n';
      const csvRows = formattedData.map(data => 
        `${data.id},${data.date},${data.amount},${data.type},${data.userName},${data.userEmail},${data.scooterModel},${data.scooterId},${data.rentalStartTime || ''},${data.rentalEndTime || ''}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=revenue-data.csv');
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
    console.error('Error exporting revenue data:', error);
    return res.status(500).json({ message: 'Failed to export revenue data', error: error.message });
  }
};