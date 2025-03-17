import React, { useState } from 'react';
import { FiFilter, FiCheck, FiX } from 'react-icons/fi';
import { IoCalendarOutline } from 'react-icons/io5';
import ExportButton from '../components/common/ExportButton';
import VerificationModal from '../components/modals/VerificationModal';
import { VERIFICATION_STATUS } from '../utils/verificationUtils';

const RiderDetails = () => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [riders] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      joiningDate: '2024-01-15',
      totalRides: 150,
      rating: 4.8,
      verificationStatus: VERIFICATION_STATUS.PENDING
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+91 98765 43211',
      joiningDate: '2024-02-01',
      totalRides: 89,
      rating: 4.5,
      verificationStatus: VERIFICATION_STATUS.VERIFIED
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      phone: '+91 98765 43212',
      joiningDate: '2024-02-15',
      totalRides: 45,
      rating: 4.2,
      verificationStatus: VERIFICATION_STATUS.IN_PROGRESS
    }
  ]);

  const handleVerifyClick = (rider) => {
    setSelectedHost(rider);
    setShowVerificationModal(true);
  };

  const handleVerificationComplete = (result) => {
    // Update rider verification status
    const updatedRiders = riders.map(rider => 
      rider.id === selectedHost.id 
        ? { ...rider, verificationStatus: result.status }
        : rider
    );
    // Update state with new rider data
    // setRiders(updatedRiders); // Uncomment when using real state management
    
    // Close modal and clear selected host
    setShowVerificationModal(false);
    setSelectedHost(null);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case VERIFICATION_STATUS.VERIFIED:
        return 'bg-green-100 text-green-800';
      case VERIFICATION_STATUS.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case VERIFICATION_STATUS.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationButton = (rider) => {
    switch (rider.verificationStatus) {
      case VERIFICATION_STATUS.VERIFIED:
        return (
          <button className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-50 rounded-lg">
            <FiCheck className="text-lg" />
            Verified
          </button>
        );
      case VERIFICATION_STATUS.REJECTED:
        return (
          <button className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg">
            <FiX className="text-lg" />
            Rejected
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleVerifyClick(rider)}
            className="px-3 py-1.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Verify Host
          </button>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Rider Details</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <IoCalendarOutline className="text-gray-500 mr-2" />
            <span>All Time</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50">
            <FiFilter />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50">
            Status
          </button>
        </div>
        <ExportButton 
          data={riders} 
          fileName="riders_data" 
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-600">Name</th>
                <th className="text-left p-4 font-medium text-gray-600">Email</th>
                <th className="text-left p-4 font-medium text-gray-600">Phone</th>
                <th className="text-left p-4 font-medium text-gray-600">Joining Date</th>
                <th className="text-left p-4 font-medium text-gray-600">Total Rides</th>
                <th className="text-left p-4 font-medium text-gray-600">Rating</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => (
                <tr key={rider.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{rider.name}</td>
                  <td className="p-4">{rider.email}</td>
                  <td className="p-4">{rider.phone}</td>
                  <td className="p-4">{new Date(rider.joiningDate).toLocaleDateString()}</td>
                  <td className="p-4">{rider.totalRides}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span>{rider.rating}</span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`${getStatusStyle(rider.verificationStatus)} px-3 py-1 rounded-full text-sm`}>
                      {rider.verificationStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    {getVerificationButton(rider)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t text-sm text-gray-500 flex justify-between items-center">
          <span>Showing 1-09 of 45</span>
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
      </div>

      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedHost(null);
          }}
          hostData={selectedHost}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
    </div>
  );
};

export default RiderDetails;
