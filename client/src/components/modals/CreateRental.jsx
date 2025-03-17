import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from '../../utils/axiosInstance';

const CreateRental = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    userId: '',
    scooterId: '',
    startTime: new Date()
  });
  const [users, setUsers] = useState([]);
  const [scooters, setScooters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAvailableScooters();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/user/getUsers?role=USER&status=VERIFIED');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchAvailableScooters = async () => {
    setIsLoading(true);
    try {
      // Only fetch available scooters
      const response = await axiosInstance.get('/scooter?status=On road');
      setScooters(response.data.scooters);
    } catch (error) {
      console.error('Error fetching scooters:', error);
      toast.error('Failed to load available scooters');
    } finally {
      setIsLoading(false);
    }
  };

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
      toast.error('Please select a user and scooter');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.post('/rental', {
        userId: formData.userId,
        scooterId: formData.scooterId,
        startTime: formData.startTime.toISOString()
      });
      
      toast.success('Rental created successfully');
      onSuccess(response.data.rental);
    } catch (error) {
      console.error('Error creating rental:', error);
      toast.error(error.response?.data?.message || 'Failed to create rental');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create New Rental</h2>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select User
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 bg-white"
              required
            >
              <option value="">-- Select a user --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Scooter
            </label>
            {isLoading ? (
              <div className="text-center p-2">
                <div className="inline-block animate-spin h-4 w-4 border-t-2 border-b-2 border-green-500 rounded-full mr-2"></div>
                Loading available scooters...
              </div>
            ) : (
              <select
                name="scooterId"
                value={formData.scooterId}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2 bg-white"
                required
              >
                <option value="">-- Select a scooter --</option>
                {scooters.map(scooter => (
                  <option key={scooter.id} value={scooter.id}>
                    {scooter.scooterId} - {scooter.model} (₹{scooter.pricePerHour}/hour)
                  </option>
                ))}
              </select>
            )}
            {scooters.length === 0 && !isLoading && (
              <p className="text-red-500 text-sm mt-1">
                No available scooters. Please ensure some scooters are marked as "On road".
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <DatePicker
              selected={formData.startTime}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full border rounded-md p-2"
              minDate={new Date()}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.userId || !formData.scooterId || scooters.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Rental'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRental;