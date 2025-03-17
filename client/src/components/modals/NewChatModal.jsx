// // src/components/chat/NewChatModal.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../utils/axiosInstance';
// import chatService from '../../services/chatServices';



// const NewChatModal = ({ isOpen, onClose, onChatCreated }) => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch users when modal opens
//   useEffect(() => {
//     if (isOpen) {
//       fetchUsers();
//     } else {
//       // Reset state when modal closes
//       setSelectedUser(null);
//       setSearchQuery('');
//       setError(null);
//     }
//   }, [isOpen]);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await axiosInstance.get('/user/getUsers?status=VERIFIED');
//       // console.log("Users API response:", response.data);
//       setUsers(response.data.users || response.data); // Check if data is nested under "users"
//       // console.log("Stored users:", response.data.users || response.data);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//       setError(err.response?.data?.message || 'Failed to load users');
//       setLoading(false);
//     }
//   };


//   const createChat = async () => {
//     if (!selectedUser) return;
    
//     try {
//       setLoading(true);
//       // Using chatService for consistent API calls
//       const newChat = await chatService.createChat([selectedUser.id]);
//       setLoading(false);
//       onChatCreated(newChat);
//       onClose();
//     } catch (err) {
//       console.error('Error creating chat:', err);
//       setError(err.message || 'Failed to create chat');
//       setLoading(false);
//     }
//   };
  
//   // Filter users based on search query
//   const filteredUsers = users.filter(user => 
//     user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     user.email?.toLowerCase().includes(searchQuery.toLowerCase())
// );
// // console.log(selectedUser);

//   // Don't render anything if modal is closed
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="bg-white rounded-lg w-full max-w-md p-4">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">New Conversation</h2>
//           <button 
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ✕
//           </button>
//         </div>
        
//         <div className="mb-4">
//           <input
//             type="text"
//             placeholder="Search users..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
//           />
//         </div>
        
//         {loading ? (
//           <div className="text-center py-4">Loading users...</div>
//         ) : error ? (
//           <div className="text-center text-red-500 py-4">{error}</div>
//         ) : (
//           <div className="max-h-60 overflow-y-auto mb-4">
//             {filteredUsers.length === 0 ? (
//               <div className="text-center text-gray-500 py-4">
//                 {searchQuery ? 'No users match your search' : 'No users found'}
//               </div>
//             ) : (
//               <ul>
//                 {filteredUsers.map(user => (
//                   <li 
//                     key={user.id}
//                     className={`
//                       p-3 rounded cursor-pointer hover:bg-gray-100
//                       ${selectedUser?.id === user.id ? 'bg-gray-100' : ''}
//                     `}
//                     onClick={() => setSelectedUser(user)}
//                   >
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
//                         {user.name
//                           ? user.name
//                               .split(' ')
//                               .map(part => part[0])
//                               .join('')
//                               .toUpperCase()
//                               .substring(0, 2)
//                           : 'U'}
//                       </div>
//                       <div className="ml-3">
//                         <div className="font-medium">{user.name || 'Unknown User'}</div>
//                         <div className="text-sm text-gray-500">{user.email || ''}</div>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
        
//         <div className="flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 border rounded mr-2 hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={createChat}
//             disabled={!selectedUser || loading}
//             className={`
//               px-4 py-2 rounded text-white
//               ${!selectedUser || loading 
//                 ? 'bg-gray-400 cursor-not-allowed' 
//                 : 'bg-green-500 hover:bg-green-600'}
//             `}
//           >
//             Start Conversation
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewChatModal;





// src/components/chat/NewChatModal.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import chatService from '../../services/chatServices';

const NewChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const location = useLocation();
  const isInChatRoute = location.pathname === '/chat';
  
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isInChatRoute ? 'admins' : 'users'); // Default to admins in chat route
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [showTabs, setShowTabs] = useState(!isInChatRoute); // Only show tabs in non-chat routes

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      // If we're in the /chat route, only fetch admins
      if (isInChatRoute) {
        fetchAdmins();
        checkRateLimit();
      } else {
        // In other routes, fetch both but focus on users
        fetchUsers();
        fetchAdmins();
        checkRateLimit();
      }
    } else {
      // Reset state when modal closes
      setSelectedUser(null);
      setSearchQuery('');
      setError(null);
      setActiveTab(isInChatRoute ? 'admins' : 'users');
    }
  }, [isOpen, isInChatRoute]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/user/getUsers?status=VERIFIED');
      // Filter out admin users from regular users list
      const regularUsers = (response.data.users || response.data).filter(
        user => user.role !== 'ADMIN'
      );
      setUsers(regularUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axiosInstance.get('/chat/admin/list');
      setAdmins(response.data);
    } catch (err) {
      console.error('Error fetching admins:', err);
      // Don't set error state here to avoid disrupting the regular user flow
    }
  };

  const checkRateLimit = async () => {
    try {
      const response = await axiosInstance.get('/chat/admin/ratelimit');
      setRateLimitInfo(response.data);
    } catch (err) {
      console.error('Error checking rate limit:', err);
    }
  };

  const createChat = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      
      // Check if trying to message an admin and if rate limited
      const isAdmin = selectedUser.role === 'ADMIN';
      
      if (isAdmin && rateLimitInfo?.isLimited) {
        setError(`You can only send 5 messages per hour to administrators. Try again later.`);
        setLoading(false);
        return;
      }
      
      // If admin already has a chat, use that one
      if (isAdmin && selectedUser.existingChatId) {
        const existingChat = await chatService.getChatById(selectedUser.existingChatId);
        setLoading(false);
        onChatCreated(existingChat);
        onClose();
        return;
      }
      
      // Create new chat
      const newChat = await chatService.createChat([selectedUser.id]);
      setLoading(false);
      onChatCreated(newChat);
      onClose();
    } catch (err) {
      console.error('Error creating chat:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create chat');
      setLoading(false);
    }
  };
  
  // Filter users based on search query and current route
  const filteredUsers = isInChatRoute
    ? admins.filter(admin => 
        admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (activeTab === 'users' 
        ? users.filter(user => 
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : admins.filter(admin => 
            admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
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
          <h2 className="text-xl font-semibold">New Conversation</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Tabs - Only show if not in /chat route */}
        {showTabs && (
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'users' 
                  ? 'border-b-2 border-green-500 text-green-500' 
                  : 'text-gray-500'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'admins' 
                  ? 'border-b-2 border-green-500 text-green-500' 
                  : 'text-gray-500'
              }`}
            >
              Administrators
            </button>
          </div>
        )}
        
        {/* Rate limit warning for admin tab or chat route */}
        {(activeTab === 'admins' || isInChatRoute) && rateLimitInfo && (
          <div className={`mb-4 p-3 rounded text-sm ${
            rateLimitInfo.isLimited
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {rateLimitInfo.isLimited 
              ? `You've reached the limit of 5 messages per hour to administrators. You can message again in ${formatTimeRemaining(rateLimitInfo.resetTime)}.`
              : `You can send ${rateLimitInfo.remaining} more messages to administrators within the next hour.`
            }
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <div className="max-h-60 overflow-y-auto mb-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                {searchQuery 
                  ? 'No matches found' 
                  : isInChatRoute 
                    ? 'No administrators found' 
                    : `No ${activeTab} found`}
              </div>
            ) : (
              <ul>
                {filteredUsers.map(user => (
                  <li 
                    key={user.id}
                    className={`
                      p-3 rounded cursor-pointer hover:bg-gray-100
                      ${selectedUser?.id === user.id ? 'bg-gray-100' : ''}
                      ${(activeTab === 'admins' || isInChatRoute) && rateLimitInfo?.isLimited ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => {
                      if ((activeTab === 'admins' || isInChatRoute) && rateLimitInfo?.isLimited) {
                        return; // Prevent selection if rate limited
                      }
                      setSelectedUser(user);
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${
                        activeTab === 'admins' ? 'bg-blue-500' : 'bg-green-500'
                      } flex items-center justify-center text-white`}>
                        {user.name
                          ? user.name
                              .split(' ')
                              .map(part => part[0])
                              .join('')
                              .toUpperCase()
                              .substring(0, 2)
                          : 'U'}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{user.name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{user.email || ''}</div>
                      </div>
                      {(activeTab === 'admins' || isInChatRoute) && user.existingChatId && (
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
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded mr-2 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={createChat}
            disabled={
              !selectedUser || 
              loading || 
              ((selectedUser?.role === 'ADMIN' || isInChatRoute) && rateLimitInfo?.isLimited)
            }
            className={`
              px-4 py-2 rounded text-white
              ${!selectedUser || 
                loading || 
                ((selectedUser?.role === 'ADMIN' || isInChatRoute) && rateLimitInfo?.isLimited)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'}
            `}
          >
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;