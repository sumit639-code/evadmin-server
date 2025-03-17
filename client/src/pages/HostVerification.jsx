import React, { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { IoCalendarOutline } from 'react-icons/io5';
import VerificationModal from '../components/common/VerificationModal';

const HostVerification = () => {
  const [hosts] = useState([
    {
      id: 1,
      name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '+1234567890',
      status: 'Pending',
      businessName: 'MJ Rentals',
      businessType: 'Individual',
      idProof: 'ID_123.pdf',
      businessLicense: 'LICENSE_123.pdf'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      phone: '+9876543210',
      status: 'Verified',
      businessName: 'City Scooters LLC',
      businessType: 'Company',
      idProof: 'ID_456.pdf',
      businessLicense: 'LICENSE_456.pdf'
    },
    // Add more hosts as needed
  ]);

  const [selectedHost, setSelectedHost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerify = (hostId) => {
    // Here you would typically make an API call to verify the host
    console.log('Verifying host:', hostId);
    setIsModalOpen(false);
    // Update host status in your state/database
  };

  const handleReject = (hostId) => {
    // Here you would typically make an API call to reject the host
    console.log('Rejecting host:', hostId);
    setIsModalOpen(false);
    // Update host status in your state/database
  };

  const openVerificationModal = (host) => {
    setSelectedHost(host);
    setIsModalOpen(true);
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Host Verification</h1>
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
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => {
            const pendingHost = hosts.find(h => h.status === 'Pending');
            if (pendingHost) openVerificationModal(pendingHost);
          }}
        >
          Verify New Hosts
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-600">Name</th>
                <th className="text-left p-4 font-medium text-gray-600">Business Name</th>
                <th className="text-left p-4 font-medium text-gray-600">Email</th>
                <th className="text-left p-4 font-medium text-gray-600">Phone</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hosts.map((host) => (
                <tr key={host.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{host.name}</td>
                  <td className="p-4">{host.businessName}</td>
                  <td className="p-4">{host.email}</td>
                  <td className="p-4">{host.phone}</td>
                  <td className="p-4">
                    <span className={`${getStatusStyle(host.status)} px-3 py-1 rounded-full text-sm`}>
                      {host.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => openVerificationModal(host)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t text-sm text-gray-500 flex justify-between items-center">
          <span>Showing 1-09 of 78</span>
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

      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedHost || {}}
        type="Host"
        onVerify={handleVerify}
        onReject={handleReject}
      />
    </div>
  );
};

export default HostVerification;
