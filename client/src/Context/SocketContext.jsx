// src/Context/SocketContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import Cookies from 'js-cookie';

// Create the socket context
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!isAuthenticated() || !user) return;
    
    // Close existing socket if it exists
    if (socket) {
      socket.disconnect();
    }


    
    // Create new socket connection
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const token = Cookies.get('token');

    
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'] // Try websocket first, then polling
    });
    
    // Set up event listeners
    newSocket.on('connect', () => {

      setConnected(true);
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected, reason:', reason);
      setConnected(false);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnected(false);
    });
    
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
    });
    
    newSocket.on('reconnect_failed', () => {
      console.log('Failed to reconnect after maximum attempts');
    });
    
    // Online status event handlers
    newSocket.on('user-online', ({ userId }) => {
      // console.log('User online:', userId);
      setOnlineUsers(prev => ({ ...prev, [userId]: true }));
    });
    
    newSocket.on('user-offline', ({ userId }) => {
      // console.log('User offline:', userId);
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
    });
    
    newSocket.on('online-status', (statuses) => {
      // console.log('Received online status update:', statuses);
      setOnlineUsers(prev => ({ ...prev, ...statuses }));
    });
    
    setSocket(newSocket);
    
    // Clean up function
    return () => {
      console.log("Cleaning up socket connection");
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [isAuthenticated, user]);

  // Initialize socket when the user changes
  useEffect(() => {
    let cleanup = null;
    
    if (isAuthenticated() && user) {
      cleanup = initializeSocket();
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [user, isAuthenticated]);

  // Function to manually disconnect the socket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  }, [socket]);

  // Function to manually reconnect the socket
  const reconnect = useCallback(() => {
    if (isAuthenticated() && user) {
      initializeSocket();
    }
  }, [isAuthenticated, user, initializeSocket]);

  // Function to request online status for specific users
  const getOnlineStatus = useCallback((userIds) => {
    if (socket && connected && Array.isArray(userIds) && userIds.length > 0) {
      socket.emit('get-online-status', { userIds });
    }
  }, [socket, connected]);

  // Function to check if a specific user is online
  const isUserOnline = useCallback((userId) => {
    return !!onlineUsers[userId];
  }, [onlineUsers]);

  // Create the context value
  const contextValue = {
    socket,
    connected,
    disconnect,
    reconnect,
    onlineUsers,
    getOnlineStatus,
    isUserOnline
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;