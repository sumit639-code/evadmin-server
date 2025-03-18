import React, { useState, useEffect } from 'react';
import { FiFilter, FiUserX, FiLock, FiUser, FiEdit2, FiTrash2, FiUserCheck } from 'react-icons/fi';
import { IoCalendarOutline } from 'react-icons/io5';
import axiosInstance from '../utils/axiosInstance';
import VerificationModal from '../components/common/VerificationModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMode, setActionMode] = useState('view'); // 'view', 'verify', 'reject', 'suspend', 'delete'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    user: null
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use the new users endpoint that returns all users
        const response = await axiosInstance.get('/user/getUsers', {
          withCredentials: true
        });
        
        // Extract users from the response
        const users = response.data.users || [];
        setUsers(users);
        
        console.log(`Fetched ${users.length} users`);
      } catch (err) {
        setError('Failed to fetch users');
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleVerify = async (userId) => {
    try {
      await axiosInstance.put(`/user/user-status/${userId}`, {
        status: 'VERIFIED'
      }, {
        withCredentials: true
      });
      // Update user status in the list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'VERIFIED' } : user
      ));
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to verify user');
      console.error(err);
    }
  };

  const handleReject = async (userId) => {
    try {
      await axiosInstance.put(`/auth/user-status/${userId}`, {
        status: 'SUSPENDED'
      }, {
        withCredentials: true
      });
      // Update user status in the list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'SUSPENDED' } : user
      ));
      setConfirmationModal({...confirmationModal, isOpen: false});
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to suspend user');
      console.error(err);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await axiosInstance.put(`/user/user-status/${userId}`, {
        status: 'SUSPENDED'
      }, {
        withCredentials: true
      });
      // Update user status in the list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'SUSPENDED' } : user
      ));
      setConfirmationModal({...confirmationModal, isOpen: false});
    } catch (err) {
      setError('Failed to suspend user');
      console.error(err);
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await axiosInstance.put(`/user/user-status/${userId}`, {
        status: 'VERIFIED'
      }, {
        withCredentials: true
      });
      // Update user status in the list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'VERIFIED' } : user
      ));
      setConfirmationModal({...confirmationModal, isOpen: false});
    } catch (err) {
      setError('Failed to unsuspend user');
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    try {
      // In a real app, you would have an API endpoint for deletion
      // await axiosInstance.delete(`/auth/delete-user/${userId}`, {
      //   withCredentials: true
      // });
      
      // For now, we'll just update the UI
      setUsers(users.filter(user => user.id !== userId));
      setConfirmationModal({...confirmationModal, isOpen: false});
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const openVerificationModal = (user, mode = 'view') => {
    setSelectedUser(user);
    setActionMode(mode);
    setIsModalOpen(true);
  };

  const openConfirmationModal = (title, message, action, user) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      action,
      user
    });
  };

  const handleConfirmationAction = () => {
    if (confirmationModal.action && confirmationModal.user) {
      confirmationModal.action(confirmationModal.user.id);
    }
  };

  const getStatusStyle = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    switch (statusLower) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Function to filter and search users
  const filteredUsers = users.filter(user => {
    // Apply status filter
    const statusMatch = activeFilter === 'all' || 
      (user.status || '').toLowerCase() === activeFilter.toLowerCase();
    
    // Apply search filter
    const searchMatch = searchTerm === '' || 
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  if (loading) return (
    <div className="bg-gray-50 min-h-screen p-6 flex justify-center items-center">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="bg-gray-50 min-h-screen p-6 flex justify-center items-center">
      <div className="text-xl text-red-600">Error: {error}</div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <IoCalendarOutline className="text-gray-500 mr-2" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Compared to</span>
            <select className="border rounded px-3 py-1.5 bg-white">
              <option>Previous period</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search by name or email"
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setSearchTerm('')}
          >
            Search
          </button>
        </div>
        
        <div className="flex gap-3">
          <button 
            className={`flex items-center gap-2 px-4 py-2 border rounded ${activeFilter === 'all' ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setActiveFilter('all')}
          >
            <FiFilter />
            All Users
          </button>
          {/* <button 
            className={`flex items-center gap-2 px-4 py-2 border rounded ${activeFilter === 'pending' ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending
          </button> */}
          <button 
            className={`flex items-center gap-2 px-4 py-2 border rounded ${activeFilter === 'verified' ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setActiveFilter('verified')}
          >
            Verified
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 border rounded ${activeFilter === 'suspended' ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setActiveFilter('suspended')}
          >
            Suspended
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No {activeFilter !== 'all' ? activeFilter : ''} users found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Name</th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left p-4 font-medium text-gray-600">Role</th>
                  <th className="text-left p-4 font-medium text-gray-600">Registration Date</th>
                  <th className="text-left p-4 font-medium text-gray-600">Last Login</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phone || '-'}</td>
                    <td className="p-4">{user.role || 'User'}</td>
                    <td className="p-4">{formatDate(user.createdAt)}</td>
                    <td className="p-4">{user.lastLogin ? formatDate(user.lastLogin) : '-'}</td>
                    <td className="p-4">
                      <span className={`${getStatusStyle(user.status)} px-3 py-1 rounded-full text-sm`}>
                        {formatStatus(user.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openVerificationModal(user, 'view')}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <FiUser size={18} />
                        </button>
                        
                        {(user.status === 'PENDING') && (
                          <button
                            onClick={() => openVerificationModal(user, 'verify')}
                            className="text-green-600 hover:text-green-800"
                            title="Verify User"
                          >
                            <FiUserCheck size={18} />
                          </button>
                        )}
                        
                        {user.status !== 'SUSPENDED' && (
                          <button
                            onClick={() => openConfirmationModal(
                              'Suspend User', 
                              `Are you sure you want to suspend ${user.name}?`,
                              handleSuspend,
                              user
                            )}
                            className="text-orange-600 hover:text-orange-800"
                            title="Suspend User"
                          >
                            <FiLock size={18} />
                          </button>
                        )}
                        
                        {user.status === 'SUSPENDED' && (
                          <button
                            onClick={() => openConfirmationModal(
                              'Unsuspend User', 
                              `Are you sure you want to unsuspend ${user.name}?`,
                              handleUnsuspend,
                              user
                            )}
                            className="text-green-600 hover:text-green-800"
                            title="Unsuspend User"
                          >
                            <FiLock size={18} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => openConfirmationModal(
                            'Delete User', 
                            `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
                            handleDelete,
                            user
                          )}
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {filteredUsers.length > 0 && (
          <div className="p-4 border-t text-sm text-gray-500 flex justify-between items-center">
            <span>Showing 1-{filteredUsers.length} of {filteredUsers.length}</span>
            <div className="flex gap-2">
              <button className="p-1 rounded hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {selectedUser && (
        <VerificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedUser}
          type="User"
          onVerify={() => handleVerify(selectedUser.id)}
          onReject={() => openConfirmationModal(
            'Reject User', 
            `Are you sure you want to reject ${selectedUser.name}?`,
            handleReject,
            selectedUser
          )}
        />
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">{confirmationModal.title}</h3>
            <p className="mb-6">{confirmationModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmationModal({...confirmationModal, isOpen: false})}
                className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmationAction}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;