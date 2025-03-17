// controllers/admin-chat.controller.js
import { PrismaClient } from '@prisma/client';
import { getIO } from '../utils/socket.js';

const prisma = new PrismaClient();

// Get list of admins for user to chat with
export const getAdminList = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get list of admins
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        status: 'VERIFIED'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    // Check if user already has chats with any of these admins
    const existingChats = await prisma.chatParticipant.findMany({
      where: {
        userId: userId
      },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    // Map admins with existing chat info
    const adminsWithChatInfo = admins.map(admin => {
      const existingChat = existingChats.find(chat => 
        chat.chat.participants.some(p => 
          p.user.id === admin.id && p.user.role === 'ADMIN'
        )
      );
      
      return {
        ...admin,
        existingChatId: existingChat ? existingChat.chatId : null
      };
    });
    
    res.status(200).json(adminsWithChatInfo);
  } catch (error) {
    console.error('Error fetching admin list:', error);
    res.status(500).json({ message: 'Failed to fetch admin list' });
  }
};

// Check user message rate limit
export const checkMessageRateLimit = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check how many messages were sent to admins in the last hour
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
    
    const resetTime = new Date(oneHourAgo.getTime() + 2 * 60 * 60 * 1000);
    
    res.status(200).json({
      hourlyLimit: 10,
      messagesSent: messageCount,
      remaining: Math.max(0, 10 - messageCount),
      resetTime: resetTime,
      isLimited: messageCount >= 10
    });
  } catch (error) {
    console.error('Error checking message rate limit:', error);
    res.status(500).json({ message: 'Failed to check message rate limit' });
  }
};

// For admins: get list of all user chats
export const getAllUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get all chats where the admin is a participant
    const chats = await prisma.chatParticipant.findMany({
      where: {
        userId: userId
      },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            },
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        }
      }
    });
    
    // Format the response with user info
    const formattedChats = chats.map(chatParticipant => {
      // Get user participants (non-admin)
      const userParticipants = chatParticipant.chat.participants
        .filter(p => p.user.role !== 'ADMIN')
        .map(p => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email
        }));
      
      return {
        id: chatParticipant.chat.id,
        userParticipants,
        unreadCount: chatParticipant.unreadCount,
        lastMessage: chatParticipant.chat.messages[0] || null,
        createdAt: chatParticipant.chat.createdAt,
        updatedAt: chatParticipant.chat.updatedAt
      };
    });
    
    res.status(200).json(formattedChats);
  } catch (error) {
    console.error('Error fetching all user chats:', error);
    res.status(500).json({ message: 'Failed to fetch user chats' });
  }
};