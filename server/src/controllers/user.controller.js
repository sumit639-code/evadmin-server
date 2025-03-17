import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
export const getUsers = async (req, res) => {
    try {
      // Get query parameters for filtering
      const { status, role, search } = req.query;
      
      // Build where condition for filtering
      const whereCondition = {};
      
      // Filter by status if provided
      if (status && ['PENDING', 'VERIFIED', 'SUSPENDED'].includes(status.toUpperCase())) {
        whereCondition.status = status.toUpperCase();
      }
      
      // Filter by role if provided
      if (role && ['USER', 'ADMIN'].includes(role.toUpperCase())) {
        whereCondition.role = role.toUpperCase();
      }
      
      // Search by name or email if provided
      if (search) {
        whereCondition.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Fetch users based on filters
      const users = await prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      return res.status(200).json({
        users
      });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
    }
  };
  
  /**
   * Update User Status Controller
   * Allows admins to change a user's status (verify, suspend, etc.)
   */
  export const updateUserStatus = async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      
      // Validate status
      if (!status || !['PENDING', 'VERIFIED', 'SUSPENDED'].includes(status.toUpperCase())) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Prevent changing status of other admins (security measure)
      if (user.role === 'ADMIN' && req.user.id !== userId) {
        return res.status(403).json({ message: 'Cannot modify status of other administrators' });
      }
  
      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status: status.toUpperCase() }
      });
  
      // Don't return the password in response
      const { password: _, ...userWithoutPassword } = updatedUser;
  
      return res.status(200).json({
        message: `User status updated to ${status.toUpperCase()}`,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update user status error:', error);
      return res.status(500).json({ message: 'Status update failed', error: error.message });
    }
  };