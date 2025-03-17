import React from 'react';
import { formatDate, calculateDuration } from '../../utils/rentalUtility';

const RentalDetailModal = ({ rental, onClose, onComplete, onCancel }) => {
  if (!rental) return null;

  const getStatusStyle = (status) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Rental Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Rider Name</p>
              <p className="font-medium">{rental.riderName || 'check'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(rental.status)}`}>
                  {rental.status}
                </span>
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Scooter ID</p>
              <p className="font-medium">{rental.scooterId}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium">{rental.scooterModel || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Start Time</p>
              <p className="font-medium">{formatDate(rental.startTime)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">End Time</p>
              <p className="font-medium">{formatDate(rental.endTime) || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{calculateDuration(rental.startTime, rental.endTime)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">{rental.amount ? `₹${rental.amount}` : '-'}</p>
            </div>
          </div>

          {rental.status === 'In Progress' && (
            <div className="border-t pt-6 flex justify-end space-x-3">
              <button
                onClick={() => onCancel(rental.id)}
                className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                Cancel Rental
              </button>
              
              <button
                onClick={() => onComplete(rental.id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800"
              >
                Complete Rental
              </button>
            </div>
          )}
          
          {rental.status !== 'In Progress' && (
            <div className="border-t pt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalDetailModal;