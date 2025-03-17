import React, { useState, useEffect } from 'react';
import { FiFilter } from 'react-icons/fi';
import { IoCalendarOutline } from 'react-icons/io5';
import axiosInstance from '../utils/axiosInstance';
import VerificationModal from '../components/common/VerificationModal';

const PendingUsersPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await axiosInstance.get('/auth/pending-users', {
          withCredentials: true // Ensures cookies are sent with request
        });
        // Set the state with the pendingUsers array from the response
        setPendingUsers(response.data.pendingUsers || []);
        console.log("Response data:", response.data); // For debugging
      } catch (err) {
        setError('Failed to fetch pending users');
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleVerify = async (userId) => {
    try {
      await axiosInstance.patch(`/auth/verify-user/${userId}`, {}, {
        withCredentials: true
      });
      // Remove verified user from the list
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to verify user');
      console.error(err);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const openVerificationModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case undefined:
      case null:
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-2xl font-semibold">Pending Users</h1>
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

      <div className="flex gap-3 mb-6">
        <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50">
          <FiFilter />
          Filters
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50">
          Status
        </button>
        {pendingUsers.length > 0 && (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => {
              const firstPendingUser = pendingUsers[0];
              if (firstPendingUser) openVerificationModal(firstPendingUser);
            }}
          >
            Verify New Users
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          {Array.isArray(pendingUsers) && pendingUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending users to verify</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Name</th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left p-4 font-medium text-gray-600">Registration Date</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(pendingUsers) && pendingUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`${getStatusStyle(user.status === 'PENDING' ? 'pending' : user.status)} px-3 py-1 rounded-full text-sm`}>
                        {user.status === 'PENDING' ? 'Pending' : user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => openVerificationModal(user)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pendingUsers.length > 0 && (
          <div className="p-4 border-t text-sm text-gray-500 flex justify-between items-center">
            <span>Showing 1-{pendingUsers.length} of {pendingUsers.length}</span>
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

      {selectedUser && (
        <VerificationModal
          isOpen={isModalOpen}
          onClose={handleClose}
          data={selectedUser}
          type="User"
          onVerify={() => handleVerify(selectedUser.id)}
          onReject={handleClose} // Using handleClose instead of reject
        />
      )}
    </div>
  );
};

export default PendingUsersPage;