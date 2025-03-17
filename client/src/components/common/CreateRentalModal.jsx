import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from '../../utils/axiosInstance';

const CreateRentalModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: '',
    scooterId: '',
    startTime: new Date()
  });
  const [users, setUsers] = useState([]);
  const [scooters, setScooters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users and available scooters in parallel
        const [usersResponse, scootersResponse] = await Promise.all([
          axiosInstance.get('/user/getUsers?role=USER&status=VERIFIED'),
          axiosInstance.get('/scooter?status=AVAILABLE')
        ]);
        
        setUsers(usersResponse.data.users || []);
        setScooters(scootersResponse.data.scooters || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, startTime: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.scooterId) {
      toast.error('Please select both a user and a scooter');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.post('/rental', {
        userId: formData.userId,
        scooterId: formData.scooterId,
        startTime: formData.startTime.toISOString()
      });
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data.rental);
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      toast.error(error.response?.data?.message || 'Failed to create rental');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Rental</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 border-t-green-600 rounded-full"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select User
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Select User --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="scooterId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Scooter
                </label>
                <select
                  id="scooterId"
                  name="scooterId"
                  value={formData.scooterId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Select Scooter --</option>
                  {scooters.map(scooter => (
                    <option key={scooter.id} value={scooter.id}>
                      {scooter.scooterId} - {scooter.model} (₹{scooter.pricePerHour}/hour)
                    </option>
                  ))}
                </select>
                {scooters.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    No scooters available. Please ensure some scooters are set to "On road" status.
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <DatePicker
                  id="startTime"
                  selected={formData.startTime}
                  onChange={handleDateChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MM/dd/yyyy h:mm aa"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  minDate={new Date()}
                />
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !formData.userId || !formData.scooterId || scooters.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Rental'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRentalModal;