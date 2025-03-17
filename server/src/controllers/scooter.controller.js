import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all scooters with optional filtering
 */
export const getScooters = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { model, status, search } = req.query;
    
    // Build where condition for filtering
    const whereCondition = {};
    
    // Filter by model if provided
    if (model && model !== 'All Models') {
      whereCondition.model = model;
    }
    
    // Filter by status if provided
    if (status && status !== 'All Status') {
      // Convert UI status format to database enum format
      const statusMapping = {
        'On road': 'ON_ROAD',
        'In Maintenance': 'IN_MAINTENANCE',
        'Offline': 'OFFLINE'
      };
      
      whereCondition.status = statusMapping[status];
    }
    
    // Search by scooterId or owner if provided
    if (search) {
      whereCondition.OR = [
        { scooterId: { contains: search, mode: 'insensitive' } },
        { owner: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Fetch scooters based on filters
    const scooters = await prisma.scooter.findMany({
      where: whereCondition,
      select: {
        id: true,
        scooterId: true,
        model: true,
        owner: true,
        status: true,
        maintenanceNote: true,
        location: true,
        pricePerHour: true,
        pricePerDay: true,
        addedAt: true,
        updatedAt: true
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    // Convert database status enum to UI status format
    const formattedScooters = scooters.map(scooter => {
      const statusMapping = {
        'ON_ROAD': 'On road',
        'IN_MAINTENANCE': 'In Maintenance',
        'OFFLINE': 'Offline',
        'AVAILABLE': 'On road' // Assuming AVAILABLE is equivalent to On road in the UI
      };

      return {
        ...scooter,
        status: statusMapping[scooter.status] || scooter.status
      };
    });

    return res.status(200).json({
      scooters: formattedScooters
    });
  } catch (error) {
    console.error('Get scooters error:', error);
    return res.status(500).json({ message: 'Failed to retrieve scooters', error: error.message });
  }
};

/**
 * Get a single scooter by ID
 */
export const getScooterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scooter = await prisma.scooter.findUnique({
      where: { id },
      include: {
        maintenanceLogs: {
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    });

    if (!scooter) {
      return res.status(404).json({ message: 'Scooter not found' });
    }

    // Convert database status enum to UI status format
    const statusMapping = {
      'ON_ROAD': 'On road',
      'IN_MAINTENANCE': 'In Maintenance',
      'OFFLINE': 'Offline',
      'AVAILABLE': 'On road'
    };

    const formattedScooter = {
      ...scooter,
      status: statusMapping[scooter.status] || scooter.status
    };

    return res.status(200).json({
      scooter: formattedScooter
    });
  } catch (error) {
    console.error('Get scooter error:', error);
    return res.status(500).json({ message: 'Failed to retrieve scooter', error: error.message });
  }
};

/**
 * Create a new scooter
 */
export const createScooter = async (req, res) => {
  try {
    const { model, owner, status, maintenanceNote, pricePerHour, pricePerDay, location, scooterId } = req.body;
    
    // Validate required fields
    if (!model || !owner || !pricePerHour) {
      return res.status(400).json({ message: 'Model, owner, and pricePerHour are required fields' });
    }

    // Convert UI status format to database enum format
    const statusMapping = {
      'On road': 'ON_ROAD',
      'In Maintenance': 'IN_MAINTENANCE',
      'Offline': 'OFFLINE'
    };

    // Create new scooter
    const newScooter = await prisma.scooter.create({
      data: {
        scooterId: scooterId || Date.now().toString(),
        model,
        owner,
        status: statusMapping[status] || 'ON_ROAD',
        maintenanceNote,
        pricePerHour,
        pricePerDay,
        location
      }
    });

    // Convert back to UI format for response
    const formattedScooter = {
      ...newScooter,
      status: Object.keys(statusMapping).find(key => statusMapping[key] === newScooter.status) || newScooter.status
    };

    return res.status(201).json({
      message: 'Scooter created successfully',
      scooter: formattedScooter
    });
  } catch (error) {
    console.error('Create scooter error:', error);
    return res.status(500).json({ message: 'Failed to create scooter', error: error.message });
  }
};

/**
 * Update an existing scooter
 */
export const updateScooter = async (req, res) => {
  try {
    const { id } = req.params;
    const { model, owner, status, maintenanceNote, pricePerHour, pricePerDay, location, scooterId } = req.body;
    
    // Check if scooter exists
    const existingScooter = await prisma.scooter.findUnique({
      where: { id }
    });

    if (!existingScooter) {
      return res.status(404).json({ message: 'Scooter not found' });
    }

    // Convert UI status format to database enum format
    const statusMapping = {
      'On road': 'ON_ROAD',
      'In Maintenance': 'IN_MAINTENANCE',
      'Offline': 'OFFLINE'
    };

    // Update scooter
    const updatedScooter = await prisma.scooter.update({
      where: { id },
      data: {
        ...(model && { model }),
        ...(owner && { owner }),
        ...(status && { status: statusMapping[status] || existingScooter.status }),
        ...(maintenanceNote !== undefined && { maintenanceNote }),
        ...(pricePerHour && { pricePerHour }),
        ...(pricePerDay !== undefined && { pricePerDay }),
        ...(location && { location }),
        ...(scooterId && { scooterId })
      }
    });

    // Convert back to UI format for response
    const formattedScooter = {
      ...updatedScooter,
      status: Object.keys(statusMapping).find(key => statusMapping[key] === updatedScooter.status) || updatedScooter.status
    };

    return res.status(200).json({
      message: 'Scooter updated successfully',
      scooter: formattedScooter
    });
  } catch (error) {
    console.error('Update scooter error:', error);
    return res.status(500).json({ message: 'Failed to update scooter', error: error.message });
  }
};

/**
 * Delete a scooter
 */
export const deleteScooter = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if scooter exists
    const existingScooter = await prisma.scooter.findUnique({
      where: { id }
    });

    if (!existingScooter) {
      return res.status(404).json({ message: 'Scooter not found' });
    }

    // Delete scooter
    await prisma.scooter.delete({
      where: { id }
    });

    return res.status(200).json({
      message: 'Scooter deleted successfully'
    });
  } catch (error) {
    console.error('Delete scooter error:', error);
    return res.status(500).json({ message: 'Failed to delete scooter', error: error.message });
  }
};

/**
 * Get maintenance logs for a specific scooter
 */
export const getScooterMaintenanceLogs = async (req, res) => {
  try {
    const { id } = req.params;
    
    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      where: {
        scooterId: id
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // Format maintenance logs for UI
    const formattedLogs = maintenanceLogs.map(log => ({
      model: log.maintenanceType, // Using maintenanceType as model in UI
      lastMaintained: log.startDate.toLocaleDateString('en-GB'), // Format to match UI
      status: log.endDate ? 'Complete' : 'In Progress'
    }));

    return res.status(200).json({
      maintenanceLogs: formattedLogs
    });
  } catch (error) {
    console.error('Get maintenance logs error:', error);
    return res.status(500).json({ message: 'Failed to retrieve maintenance logs', error: error.message });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get current date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format dates to match database format
    const todayFormatted = today.toISOString().split('T')[0];
    const yesterdayFormatted = yesterday.toISOString().split('T')[0];
    
    // Get today's stats
    const todayStats = await prisma.dailyStats.findUnique({
      where: {
        date: todayFormatted
      }
    }) || { totalRevenue: 0, income: 0, expenses: 0 };
    
    // Get yesterday's stats
    const yesterdayStats = await prisma.dailyStats.findUnique({
      where: {
        date: yesterdayFormatted
      }
    }) || { totalRevenue: 0, income: 0, expenses: 0 };
    
    // Calculate percentage changes
    const calculatePercentChange = (today, yesterday) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return Math.round(((today - yesterday) / yesterday) * 100);
    };
    
    const revenueChange = calculatePercentChange(todayStats.totalRevenue, yesterdayStats.totalRevenue);
    const incomeChange = calculatePercentChange(todayStats.income, yesterdayStats.income);
    const expensesChange = calculatePercentChange(todayStats.expenses, yesterdayStats.expenses);
    
    return res.status(200).json({
      stats: {
        totalRevenue: {
          amount: todayStats.totalRevenue,
          percentChange: revenueChange,
          increased: revenueChange >= 0
        },
        income: {
          amount: todayStats.income,
          percentChange: incomeChange,
          increased: incomeChange >= 0
        },
        expenses: {
          amount: todayStats.expenses,
          percentChange: expensesChange,
          increased: expensesChange >= 0
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ message: 'Failed to retrieve dashboard statistics', error: error.message });
  }
};


export const getPublicAvailableScooters = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { model, search } = req.query;
    
    // Build where condition for filtering
    const whereCondition = {
      // Only show available scooters to the public
      status: 'AVAILABLE'
    };
    
    // Filter by model if provided
    if (model && model !== 'All Models') {
      whereCondition.model = model;
    }
    
    // Search by scooterId or model if provided
    if (search) {
      whereCondition.OR = [
        { scooterId: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Fetch scooters based on filters
    const scooters = await prisma.scooter.findMany({
      where: whereCondition,
      select: {
        id: true,
        scooterId: true,
        model: true,
        pricePerHour: true,
        pricePerDay: true,
        status: true
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    return res.status(200).json(scooters);
  } catch (error) {
    console.error('Get public scooters error:', error);
    return res.status(500).json({ message: 'Failed to retrieve available scooters', error: error.message });
  }
};


/**
 * Get a single scooter by ID for public viewing
 * This endpoint is public with limited information
 */
export const getPublicScooterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scooter = await prisma.scooter.findUnique({
      where: { id },
      select: {
        id: true,
        scooterId: true,
        model: true,
        pricePerHour: true,
        pricePerDay: true,
        status: true
      }
    });

    if (!scooter) {
      return res.status(404).json({ message: 'Scooter not found' });
    }

    // Only return if scooter is available
    if (scooter.status !== 'AVAILABLE') {
      return res.status(404).json({ message: 'Scooter not available for booking' });
    }

    return res.status(200).json(scooter);
  } catch (error) {
    console.error('Get public scooter error:', error);
    return res.status(500).json({ message: 'Failed to retrieve scooter details', error: error.message });
  }
};