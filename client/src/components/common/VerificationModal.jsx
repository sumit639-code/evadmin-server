import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FiCheck, FiX } from 'react-icons/fi';

const VerificationModal = ({ isOpen, onClose, data, type, onVerify, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Verify {type}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{data.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{data.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{data.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`inline-flex px-2 py-1 rounded-full text-sm
                  ${data.status === 'Verified' ? 'bg-green-100 text-green-800' :
                    data.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {data.status}
                </p>
              </div>
            </div>
          </div>

          {type === 'Host' && (
            <div className="space-y-2">
              <h3 className="font-medium">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium">{data.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium">{data.businessType}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Documents</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID Proof</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm">View Document</button>
              </div>
              {type === 'Host' && (
                <div>
                  <p className="text-sm text-gray-500">Business License</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">View Document</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => onVerify(data.id)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <FiCheck />
            Verify
          </button>
          <button
            onClick={() => onReject(data.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <FiX />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
