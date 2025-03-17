// // utils/socket.js
// import { Server } from 'socket.io';
// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();
// let io;

// export const initializeSocket = (server) => {

//   io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_URL || 'http://localhost:5173',
//       methods: ['GET', 'POST'],
//       credentials: true
//     }
//   });

//   io.use(async (socket, next) => {
//     // Authentication middleware for socket connections
//     try {
//       // Extract token from cookies instead of auth object
//     const cookies = socket.handshake.headers.cookie;
//     console.log("Cookies received:", cookies);

//     // Parse cookies manually if needed
//     const parseCookies = (cookieString) => {
//       const cookies = {};
//       cookieString?.split(';').forEach(cookie => {
//         const [name, value] = cookie.split('=').map(c => c.trim());
//         cookies[name] = value;
//       });
//       return cookies;
//     };

//     const parsedCookies = parseCookies(cookies);
//     const token = parsedCookies['token'];

//     console.log("Token from cookies:", token);

//     if (!token) {
//       return next(new Error('Authentication error: No token found'));
//     }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.userId;

//       const user = await prisma.user.findUnique({
//         where: { id: decoded.userId }
//       });

//       if (!user) {
//         return next(new Error('User not found'));
//       }

//       socket.user = {
//         id: user.id,
//         name: user.name,
//         email: user.email
//       };

//       next();
//     } catch (error) {
//       console.error('Socket authentication error:', error);
//       next(new Error('Authentication error'));
//     }
//   });

//   io.on('connection', (socket) => {

//     console.log(`User connected: ${socket.user.name} (${socket.userId})`);

//     // Join personal room for direct messages
//     socket.join(`user:${socket.userId}`);

//     // Join all chat rooms the user is part of
//     joinUserChats(socket);

//     // Handle sending messages
//     socket.on('send-message', async (data) => {
//       try {
//         const { chatId, content } = data;

//         // Check if user is a participant
//         const participant = await prisma.chatParticipant.findUnique({
//           where: {
//             chatId_userId: {
//               chatId: chatId,
//               userId: socket.userId
//             }
//           }
//         });

//         if (!participant) {
//           socket.emit('error', { message: 'Access denied' });
//           return;
//         }

//         // Create message
//         const message = await prisma.message.create({
//           data: {
//             chatId: chatId,
//             senderId: socket.userId,
//             content: content
//           },
//           include: {
//             sender: {
//               select: {
//                 id: true,
//                 name: true
//               }
//             }
//           }
//         });

//         // Update unread count for other participants
//         await prisma.chatParticipant.updateMany({
//           where: {
//             chatId: chatId,
//             userId: {
//               not: socket.userId
//             }
//           },
//           data: {
//             unreadCount: {
//               increment: 1
//             }
//           }
//         });

//         // Broadcast message to all participants in the chat
//         io.to(`chat:${chatId}`).emit('new-message', message);

//         // For offline users, we'll handle notifications separately
//         const otherParticipants = await prisma.chatParticipant.findMany({
//           where: {
//             chatId: chatId,
//             userId: {
//               not: socket.userId
//             }
//           },
//           select: {
//             userId: true
//           }
//         });

//         // Notify other participants about unread messages
//         otherParticipants.forEach(participant => {
//           io.to(`user:${participant.userId}`).emit('unread-update', {
//             chatId,
//             messageId: message.id
//           });
//         });
//       } catch (error) {
//         console.error('Error sending message:', error);
//         socket.emit('error', { message: 'Failed to send message' });
//       }
//     });

//     // Handle marking messages as read
//     socket.on('mark-read', async (data) => {
//       try {
//         const { chatId } = data;

//         await prisma.chatParticipant.update({
//           where: {
//             chatId_userId: {
//               chatId: chatId,
//               userId: socket.userId
//             }
//           },
//           data: {
//             unreadCount: 0,
//             lastReadAt: new Date()
//           }
//         });

//         socket.emit('read-confirmed', { chatId });
//       } catch (error) {
//         console.error('Error marking as read:', error);
//         socket.emit('error', { message: 'Failed to mark as read' });
//       }
//     });

//     // Handle user typing indicator
//     socket.on('typing', (data) => {
//       const { chatId } = data;
//       socket.to(`chat:${chatId}`).emit('user-typing', {
//         chatId,
//         userId: socket.userId,
//         userName: socket.user.name
//       });
//     });

//     // Handle user stop typing
//     socket.on('stop-typing', (data) => {
//       const { chatId } = data;
//       socket.to(`chat:${chatId}`).emit('user-stop-typing', {
//         chatId,
//         userId: socket.userId
//       });
//     });

//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);
//     });
//   });

//   return io;
// };

// // Helper function to join a user to all their chat rooms
// async function joinUserChats(socket) {
//   try {
//     const chats = await prisma.chatParticipant.findMany({
//       where: {
//         userId: socket.userId
//       },
//       select: {
//         chatId: true
//       }
//     });

//     chats.forEach(chat => {
//       socket.join(`chat:${chat.chatId}`);
//     });
//   } catch (error) {
//     console.error('Error joining chat rooms:', error);
//   }
// }

// export const getIO = () => {
//   if (!io) {
//     throw new Error('Socket.io not initialized');
//   }
//   return io;
// };

// utils/socket.js
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
let io;

// Track online users
const onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    // Authentication middleware for socket connections
    try {
      // Extract token from cookies
      const cookies = socket.handshake.headers.cookie;
      // console.log("Cookies received:", cookies);

      // Parse cookies manually if needed
      const parseCookies = (cookieString) => {
        const cookies = {};
        cookieString?.split(";").forEach((cookie) => {
          const [name, value] = cookie.split("=").map((c) => c.trim());
          cookies[name] = value;
        });
        return cookies;
      };

      const parsedCookies = parseCookies(cookies);
      const token = parsedCookies["token"];

      // console.log("Token from cookies:", token);

      if (!token) {
        return next(new Error("Authentication error: No token found"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Add user to online users map
    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
    });

    // Join personal room for direct messages
    socket.join(`user:${socket.userId}`);

    // Join all chat rooms the user is part of
    joinUserChats(socket);

    // Broadcast user online status to relevant users
    broadcastUserStatus(socket.userId, true);

    // Handle sending messages
    socket.on("send-message", async (data) => {
      try {
        const { chatId, content } = data;

        // Check if user is a participant
        const participant = await prisma.chatParticipant.findUnique({
          where: {
            chatId_userId: {
              chatId: chatId,
              userId: socket.userId,
            },
          },
        });

        if (!participant) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            chatId: chatId,
            senderId: socket.userId,
            content: content,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Update unread count for other participants

        await prisma.chatParticipant.updateMany({
          where: {
            chatId: chatId,
            userId: {
              not: socket.userId, // This correctly excludes the sender
            },
          },
          data: {
            unreadCount: {
              increment: 1,
            },
          },
        });

        // Broadcast message to all participants in the chat
        io.to(`chat:${chatId}`).emit("new-message", message);

        // For offline users, we'll handle notifications separately
        const otherParticipants = await prisma.chatParticipant.findMany({
          where: {
            chatId: chatId,
            userId: {
              not: socket.userId,
            },
          },
          select: {
            userId: true,
          },
        });

        // Notify other participants about unread messages
        otherParticipants.forEach((participant) => {
          io.to(`user:${participant.userId}`).emit("unread-update", {
            chatId,
            messageId: message.id,
          });
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle marking messages as read
    socket.on("mark-read", async (data) => {
      try {
        const { chatId } = data;

        await prisma.chatParticipant.update({
          where: {
            chatId_userId: {
              chatId: chatId,
              userId: socket.userId,
            },
          },
          data: {
            unreadCount: 0,
            lastReadAt: new Date(),
          },
        });

        socket.emit("read-confirmed", { chatId });
      } catch (error) {
        console.error("Error marking as read:", error);
        socket.emit("error", { message: "Failed to mark as read" });
      }
    });

    // Handle user typing indicator
    socket.on("typing", (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit("user-typing", {
        chatId,
        userId: socket.userId,
        userName: socket.user.name,
      });
    });

    // Handle user stop typing
    socket.on("stop-typing", (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit("user-stop-typing", {
        chatId,
        userId: socket.userId,
      });
    });

    // Request online status for specific users
    socket.on("get-online-status", async (data) => {
      try {
        const { userIds } = data;
        const statuses = {};

        userIds.forEach((userId) => {
          statuses[userId] = onlineUsers.has(userId);
        });

        socket.emit("online-status", statuses);
      } catch (error) {
        console.error("Error getting online status:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);

      // Remove user from online users map
      onlineUsers.delete(socket.userId);

      // Broadcast user offline status
      broadcastUserStatus(socket.userId, false);
    });
  });

  return io;
};

// Helper function to join a user to all their chat rooms
async function joinUserChats(socket) {
  try {
    const chats = await prisma.chatParticipant.findMany({
      where: {
        userId: socket.userId,
      },
      select: {
        chatId: true,
      },
    });

    chats.forEach((chat) => {
      socket.join(`chat:${chat.chatId}`);
    });
  } catch (error) {
    console.error("Error joining chat rooms:", error);
  }
}

// Helper function to broadcast user status to relevant users
async function broadcastUserStatus(userId, isOnline) {
  try {
    // Find all chats the user is part of
    const userChats = await prisma.chatParticipant.findMany({
      where: {
        userId: userId,
      },
      select: {
        chatId: true,
      },
    });

    // Find all other participants in those chats
    const relevantParticipants = new Set();

    for (const chat of userChats) {
      const otherParticipants = await prisma.chatParticipant.findMany({
        where: {
          chatId: chat.chatId,
          userId: {
            not: userId,
          },
        },
        select: {
          userId: true,
        },
      });

      otherParticipants.forEach((participant) => {
        relevantParticipants.add(participant.userId);
      });
    }

    // Broadcast to all relevant participants
    const statusEvent = isOnline ? "user-online" : "user-offline";

    relevantParticipants.forEach((participantId) => {
      io.to(`user:${participantId}`).emit(statusEvent, { userId });
    });
  } catch (error) {
    console.error("Error broadcasting user status:", error);
  }
}

// Helper function to check if a user is online
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

// Get all online users
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
