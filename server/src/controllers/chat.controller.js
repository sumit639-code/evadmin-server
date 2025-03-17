// controllers/chat.controller.js
import { PrismaClient } from "@prisma/client";
import { getIO } from "../utils/socket.js";

const prisma = new PrismaClient();

// Get all chats for a user
// In chat.controller.js - getUserChats function
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chats = await prisma.chatParticipant.findMany({
      where: {
        userId: userId,
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
                  },
                },
              },
            },
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    // Format the response - make sure to properly extract user info
    const formattedChats = chats.map((chatParticipant) => {
      // Get other users participating in this chat
      const otherParticipants = chatParticipant.chat.participants
        .filter((p) => p.userId !== userId)
        .map((p) => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
        }));

      return {
        id: chatParticipant.chat.id,
        participants: otherParticipants,
        unreadCount: chatParticipant.unreadCount,
        lastMessage: chatParticipant.chat.messages[0] || null,
        createdAt: chatParticipant.chat.createdAt,
        updatedAt: chatParticipant.chat.updatedAt,
        adminApproved: chatParticipant.chat.adminApproved || false,  // Add this line
        isBlocked: chatParticipant.chat.isBlocked || false  // Add this line too
      };
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};
// Get a single chat with messages
export const getChatById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chatId = req.params.id;

    // Check if user is a participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: userId,
        },
      },
    });

    if (!participant) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get chat with messages
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        // adminApproved: true,
        // isBlocked: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
// console.log(chat);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark messages as read
    await prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: userId,
        },
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });

    // Also update the isRead field for messages
    await prisma.message.updateMany({
      where: {
        chatId: chatId,
        senderId: {
          not: userId, // Only mark messages from others as read
        },
        isRead: false, // Only update messages that aren't already read
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
};

// Create a new chat
// controllers/chat.controller.js
export const createChat = async (req, res) => {
  try {
    const { participantIds } = req.body;
    const userId = req.user.userId;

    console.log("Current user ID:", userId);
    console.log("Participant IDs:", participantIds);

    // Check if userId exists before proceeding
    if (!userId) {
      return res.status(400).json({
        message: "User ID not found in request. Please check authentication.",
      });
    }

    // Ensure current user is included in participants
    const allParticipantIds = [...new Set([...participantIds, userId])];

    console.log("All participant IDs:", allParticipantIds);

    // Check if all IDs are valid (not undefined)
    if (allParticipantIds.some((id) => !id)) {
      return res.status(400).json({
        message: "Invalid participant ID found. All IDs must be valid.",
      });
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        participants: {
          create: allParticipantIds.map((id) => ({
            userId: id,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const userId = req.user.userId;

    // Check if user is a participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: userId,
        },
      },
    });

    if (!participant) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get chat with messages to check if it's blocked or needs approval
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          select: { id: true }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if blocked
    if (chat.isBlocked) {
      return res.status(403).json({
        message: "This conversation has been blocked by an administrator",
      });
    }

    // Check if user is admin (admins can always send messages)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Check if this is the first message in the chat
    const isFirstMessage = chat.messages.length === 0;

    // If not admin and chat not approved AND this is not the first message, block it
    if (user.role !== "ADMIN" && !chat.adminApproved && !isFirstMessage) {
      return res.status(403).json({
        message:
          "Please wait for an admin to approve this conversation before sending additional messages",
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId: chatId,
        senderId: userId,
        content: content,
        isRead: true, // Mark as read for sender
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
          not: userId,
        },
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    });

    // Emit event via socket
    try {
      const io = getIO();
      io.to(`chat:${chatId}`).emit("new-message", message);

      // Notify other participants about unread messages
      const otherParticipants = await prisma.chatParticipant.findMany({
        where: {
          chatId: chatId,
          userId: {
            not: userId,
          },
        },
        select: {
          userId: true,
        },
      });

      otherParticipants.forEach((participant) => {
        io.to(`user:${participant.userId}`).emit("unread-update", {
          chatId,
          messageId: message.id,
        });
      });
    } catch (socketError) {
      console.error("Socket error when sending message:", socketError);
      // Continue even if socket fails
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Mark messages as read
// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Update the unreadCount for the participant
    await prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: userId,
        },
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });

    // Also update the isRead field for messages
    await prisma.message.updateMany({
      where: {
        chatId: chatId,
        senderId: {
          not: userId, // Only mark messages from others as read
        },
        isRead: false, // Only update messages that aren't already read
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

// Approve a chat request (admin only)
export const approveChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only admins can approve chat requests" });
    }

    // Update chat
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        adminApproved: true,
        isBlocked: false,
      },
    });

    // Notify all participants via socket
    try {
      const io = getIO();
      io.to(`chat:${chatId}`).emit("chat-status-changed", {
        chatId,
        adminApproved: true,
        isBlocked: false,
      });
    } catch (socketError) {
      console.error("Socket error when approving chat:", socketError);
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error approving chat:", error);
    res.status(500).json({ message: "Failed to approve chat" });
  }
};

// Block a chat (admin only)
export const blockChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can block chats" });
    }

    // Update chat
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { isBlocked: true },
    });

    // Notify all participants via socket
    try {
      const io = getIO();
      io.to(`chat:${chatId}`).emit("chat-status-changed", {
        chatId,
        adminApproved: false,
        isBlocked: true,
      });
    } catch (socketError) {
      console.error("Socket error when blocking chat:", socketError);
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error blocking chat:", error);
    res.status(500).json({ message: "Failed to block chat" });
  }
};

// Unblock a chat (admin only)
export const unblockChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can unblock chats" });
    }

    // Update chat
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { isBlocked: false },
    });

    // Notify all participants via socket
    try {
      const io = getIO();
      io.to(`chat:${chatId}`).emit("chat-status-changed", {
        chatId,
        isBlocked: false,
      });
    } catch (socketError) {
      console.error("Socket error when unblocking chat:", socketError);
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error unblocking chat:", error);
    res.status(500).json({ message: "Failed to unblock chat" });
  }
};


// Delete a chat (admin only)
export const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete chats' });
    }
    
    // Delete all messages in the chat first
    await prisma.message.deleteMany({
      where: { chatId: chatId }
    });
    
    // Delete all chat participants
    await prisma.chatParticipant.deleteMany({
      where: { chatId: chatId }
    });
    
    // Delete the chat
    await prisma.chat.delete({
      where: { id: chatId }
    });
    
    // Notify all participants via socket
    try {
      const io = getIO();
      io.to(`chat:${chatId}`).emit('chat-deleted', {
        chatId
      });
    } catch (socketError) {
      console.error('Socket error when deleting chat:', socketError);
    }
    
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};