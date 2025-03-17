// utils/socketClient.js
import io from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    // If already initialized, just return the existing socket
    return socket;
  }
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  socket = io(API_URL, {
    auth: { token }
  });
  
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};