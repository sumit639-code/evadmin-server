// src/components/chat/AdminContactModal.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import chatService from '../../services/chatServices';
import { MessageCircle, Clock, AlertCircle } from 'lucide-react';

const AdminContactModal = ({ isOpen, onClose, onChatCreated }) => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [initialMessage, setInitialMessage] = useState('');

  // Fetch admins when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
      checkRateLimit();
    } else {
      // Reset state when modal closes
      setSelectedAdmin(null);
      setSearchQuery('');
      setError(null);
      setInitialMessage('');
    }
  }, [isOpen]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAdminList();
      setAdmins(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError(err.response?.data?.message || 'Failed to load administrators');
      setLoading(false);
    }
  };

  const checkRateLimit = async () => {
    try {
      const response = await chatService.checkAdminMessageRateLimit();
      setRateLimitInfo(response);
    } catch (err) {
      console.error('Error checking rate limit:', err);
    }
  };

  const createChat = async () => {
    if (!selectedAdmin) return;
    
    try {
      setLoading(true);
      
      // Check if rate limited
      if (rateLimitInfo?.isLimited) {
        setError(`You can only send 5 messages per hour to administrators. Try again later.`);
        setLoading(false);
        return;
      }
      
      // If admin already has a chat, use that one
      if (selectedAdmin.existingChatId) {
        const existingChat = await chatService.getChatById(selectedAdmin.existingChatId);
        
        // If there's an initial message, send it
        if (initialMessage.trim()) {
          await chatService.sendMessage(existingChat.id, initialMessage.trim());
        }
        
        setLoading(false);
        onChatCreated(existingChat);
        onClose();
        return;
      }
      
      // Create new chat
      const newChat = await chatService.createChat([selectedAdmin.id]);
      
      // If there's an initial message, send it
      if (initialMessage.trim()) {
        await chatService.sendMessage(newChat.id, initialMessage.trim());
      }
      
      setLoading(false);
      onChatCreated(newChat);
      onClose();
    } catch (err) {
      console.error('Error creating chat:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create chat');
      setLoading(false);
    }
  };
  
  // Filter admins based on search query
  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format the time remaining for rate limit
  const formatTimeRemaining = (resetTime) => {
    if (!resetTime) return '';
    
    const now = new Date();
    const reset = new Date(resetTime);
    const diffMs = Math.max(0, reset - now);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${mins}m`;
    } else {
      return `${mins} minutes`;
    }
  };

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact Administrator</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Rate limit information */}
        {rateLimitInfo && (
          <div className={`mb-4 p-3 rounded text-sm ${
            rateLimitInfo.isLimited
              ? 'bg-red-100 text-red-700 flex items-center gap-2'
              : 'bg-blue-100 text-blue-700 flex items-center gap-2'
          }`}>
            {rateLimitInfo.isLimited ? (
              <>
                <AlertCircle size={16} />
                <span>
                  You've reached the limit of 5 messages per hour to administrators. 
                  You can message again in {formatTimeRemaining(rateLimitInfo.resetTime)}.
                </span>
              </>
            ) : (
              <>
                <MessageCircle size={16} />
                <span>
                  You can send {rateLimitInfo.remaining} more messages to administrators within the next hour.
                </span>
              </>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Select an administrator to contact:
          </p>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {loading && admins.length === 0 ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p>Loading administrators...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4 flex flex-col items-center">
            <AlertCircle size={24} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto mb-4 border rounded">
            {filteredAdmins.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                {searchQuery ? 'No administrators match your search' : 'No administrators available'}
              </div>
            ) : (
              <ul className="divide-y">
                {filteredAdmins.map(admin => (
                  <li 
                    key={admin.id}
                    className={`
                      p-3 cursor-pointer hover:bg-gray-50 transition-colors
                      ${selectedAdmin?.id === admin.id ? 'bg-blue-50' : ''}
                      ${rateLimitInfo?.isLimited ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => {
                      if (rateLimitInfo?.isLimited) return; // Prevent selection if rate limited
                      setSelectedAdmin(admin);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {admin.name
                          ? admin.name
                              .split(' ')
                              .map(part => part[0])
                              .join('')
                              .toUpperCase()
                              .substring(0, 2)
                          : 'A'}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{admin.name || 'Unknown Admin'}</div>
                        <div className="text-sm text-gray-500">{admin.email || ''}</div>
                      </div>
                      {admin.existingChatId && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                          Existing chat
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {/* Optional initial message */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial message:
          </label>
          <textarea
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
            placeholder="Enter your initial message..."
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            disabled={rateLimitInfo?.isLimited}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded mr-2 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={createChat}
            disabled={!selectedAdmin && !initialMessage || loading || rateLimitInfo?.isLimited}
            className={`
              px-4 py-2 rounded text-white
              ${!selectedAdmin || loading || rateLimitInfo?.isLimited
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'}
            `}
          >
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminContactModal;