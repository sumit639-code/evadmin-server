// middleware/messageLimiter.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Rate limit for messages: 5 messages per hour to admin users
export const messageRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { chatId, participantIds } = req.body;
    
    // Skip rate limiting for admin users
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (currentUser.role === 'ADMIN') {
      return next(); // Admins are not rate limited
    }
    
    // Check if this is a message to an admin
    let isAdminChat = false;
    
    if (chatId) {
      // If chatId is provided, check if any participant is admin
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  role: true
                }
              }
            }
          }
        }
      });
      
      if (chat) {
        isAdminChat = chat.participants.some(p => p.user.role === 'ADMIN');
      }
    } else if (participantIds && participantIds.length > 0) {
      // For new chats, check if any participant is admin
      const adminUsers = await prisma.user.findMany({
        where: {
          id: { in: participantIds },
          role: 'ADMIN'
        }
      });
      
      isAdminChat = adminUsers.length > 0;
    }
    
    // Only apply rate limiting for messages to admins
    if (isAdminChat) {
      // Check how many messages were sent in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const messageCount = await prisma.message.count({
        where: {
          senderId: userId,
          createdAt: {
            gte: oneHourAgo
          },
          chat: {
            participants: {
              some: {
                user: {
                  role: 'ADMIN'
                }
              }
            }
          }
        }
      });

      
      if (messageCount >= 10) {
        return res.status(429).json({
          message: 'Rate limit exceeded: You can only send 5 messages per hour to administrators.',
          hourlyLimit: 10,
          messagesSent: messageCount,
          resetTime: new Date(oneHourAgo.getTime() + 2 * 60 * 60 * 1000) // +2 hours from oneHourAgo
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in message rate limiter:', error);
    next(); // Continue even if limiter fails
  }
};