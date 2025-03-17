// services/chatServices.js
import axiosInstance from '../utils/axiosInstance';

const chatService = {
  // Get all chats for the current user
  getUserChats: async () => {
    try {
      const response = await axiosInstance.get('/chat');
      return response.data;
    } catch (error) {
      console.error('Error in getUserChats:', error);
      throw error;
    }
  },
  
  // Get a specific chat by ID
  getChatById: async (chatId) => {
    try {
      const response = await axiosInstance.get(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getChatById:', error);
      throw error;
    }
  },
  
  // Create a new chat
  createChat: async (participantIds) => {
    try {
      const response = await axiosInstance.post('/chat', {
        participantIds
      });
      return response.data;
    } catch (error) {
      console.error('Error in createChat:', error);
      throw error;
    }
  },
  
  // Send a message
 // Send a message with improved error handling
sendMessage: async (chatId, content) => {
  try {
    const response = await axiosInstance.post('/chat/message', {
      chatId,
      content
    });
    return response.data;
  } catch (error) {
    // Check if it's a chat permission issue (403)
    if (error.response && error.response.status === 403) {
      console.log('Chat permission error:', error.response.data.message);
      // Rethrow the error with the message for the UI to display
      throw new Error(error.response.data.message || 'You do not have permission to send this message');
    }
    
    console.error('Error in sendMessage:', error);
    throw error;
  }
},
  
  // Mark messages as read
  markAsRead: async (chatId) => {
    try {
      const response = await axiosInstance.put(`/chat/${chatId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  },
  
  // Get list of admins available to chat with
  getAdminList: async () => {
    try {
      const response = await axiosInstance.get('/chat/admin/list');
      return response.data;
    } catch (error) {
      console.error('Error in getAdminList:', error);
      throw error;
    }
  },
  
  // Approve a chat request (admin only)
  approveChatRequest: async (chatId) => {
    try {
      const response = await axiosInstance.put(`/chat/${chatId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error in approveChatRequest:', error);
      throw error;
    }
  },
  
  // Block a chat (admin only)
  blockChat: async (chatId) => {
    try {
      const response = await axiosInstance.put(`/chat/${chatId}/block`);
      return response.data;
    } catch (error) {
      console.error('Error in blockChat:', error);
      throw error;
    }
  },
  
  // Unblock a chat (admin only)
  unblockChat: async (chatId) => {
    try {
      const response = await axiosInstance.put(`/chat/${chatId}/unblock`);
      return response.data;
    } catch (error) {
      console.error('Error in unblockChat:', error);
      throw error;
    }
  },
  deleteChat: async (chatId) => {
    try {
      const response = await axiosInstance.delete(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteChat:', error);
      throw error;
    }
  },
  
  // For admins: get all user chats
  getAllUserChats: async () => {
    try {
      const response = await axiosInstance.get('/chat/admin/all');
      return response.data;
    } catch (error) {
      console.error('Error in getAllUserChats:', error);
      throw error;
    }
  }
};

export default chatService;