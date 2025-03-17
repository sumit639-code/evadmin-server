// src/pages/PendingVerificationPage.js
import React from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const PendingVerificationPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Account Pending Verification</h2>
        
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-center text-yellow-700">
            Your account is currently pending verification by an administrator.
          </p>
          
          {user && (
            <div className="mt-4">
              <p className="text-gray-700">
                <strong>Name:</strong> {user.name}
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-gray-700">
                <strong>Status:</strong>{' '}
                <span className="text-yellow-600 font-semibold">PENDING</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="mb-4 text-gray-700">
            Please check back later or contact support for assistance.
          </p>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingVerificationPage;

// import React from 'react'

// const PendingVerificationPage = () => {
//   return (
//     <div>PendingVerificationPage</div>
//   )
// }

// export default PendingVerificationPage