import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../Context/AuthContext';

// Separate component for scooter image with error handling
const ScooterImage = ({ model }) => {
  const [imageSrc, setImageSrc] = useState('/images/scooter-placeholder.jpg');
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Only try to load the model-specific image if we haven't had an error yet
    // and if model is defined
    if (!hasError && model) {
      try {
        const modelImagePath = `http://localhost:3000${model?.image}`;
        setImageSrc(modelImagePath);
      } catch (err) {
        // If any error occurs during path creation, use placeholder
        console.error("Error creating image path:", err);
        setImageSrc('/images/scooter-placeholder.jpg');
        setHasError(true);
      }
    }
  }, [model, hasError]);
  
  return (
    <img 
      src={imageSrc}
      alt={`${model || 'Scooter'}`}
      className="w-full h-48 object-cover rounded-md mb-4"
      onError={() => {
        if (!hasError) {
          console.log("Image failed to load, using placeholder");
          setImageSrc('/images/scooter-placeholder.jpg');
          setHasError(true);
        }
      }}
    />
  );
};

const NewBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const scooterId = location.state?.scooterId;
  
  const [scooter, setScooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    startTime: '',
    estimatedDuration: '1',
    rentalType: 'hourly',
  });
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    if (!scooterId) {
      navigate('/available-vehicles');
      return;
    }

    const fetchScooterDetails = async () => {
      try {
        setLoading(true);
        // Using your current API endpoint
        const response = await axiosInstance.get(`/scooter/${scooterId}`);
        
        console.log("API Response:", response.data);
        
        // Handle nested response structure
        if (response.data && response.data.scooter) {
          setScooter(response.data.scooter);
        } else {
          setScooter(response.data);
        }
      } catch (err) {
        console.error('Error fetching scooter details:', err);
        setError('Failed to load vehicle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchScooterDetails();
  }, [scooterId, navigate]);

  useEffect(() => {
    if (scooter) {
      calculateEstimatedCost();
    }
  }, [formData, scooter]);

  const calculateEstimatedCost = () => {
    if (!scooter) return;
    
    const duration = parseFloat(formData.estimatedDuration);
    
    if (formData.rentalType === 'hourly') {
      setEstimatedCost(duration * scooter.pricePerHour);
    } else if (formData.rentalType === 'daily' && scooter.pricePerDay) {
      setEstimatedCost(duration * scooter.pricePerDay);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Convert the duration based on rental type
      const durationInHours = formData.rentalType === 'hourly' 
        ? parseFloat(formData.estimatedDuration)
        : parseFloat(formData.estimatedDuration) * 24;
      
      // Calculate end time based on start time and duration
      const startTime = new Date(formData.startTime);
      const endTime = new Date(startTime.getTime() + (durationInHours * 60 * 60 * 1000));
      
      const bookingData = {
        scooterId: scooter.id,
        userId: user.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: formData.rentalType === 'hourly' 
          ? `${formData.estimatedDuration} hours` 
          : `${formData.estimatedDuration} days`,
        amount: estimatedCost,
      };
      
      // Use the current endpoint you're using
      const response = await axiosInstance.post('/rental', bookingData);
      
      navigate('/myBookings', { 
        state: { 
          success: true, 
          message: 'Your booking has been confirmed!',
          bookingId: response.data.id || response.data.booking?.id
        } 
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !scooter) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          onClick={() => navigate('/available-vehicles')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Back to Available Vehicles
        </button>
      </div>
    );
  }

  if (!scooter) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/available-vehicles')}
          className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Book a Vehicle</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-4 bg-gray-50">
            <div className="relative">
              {/* Using the separate image component */}
              <ScooterImage model={scooter} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{scooter.model || 'Scooter'}</h2>
            <p className="text-gray-600 mb-4">ID: {scooter.scooterId || 'N/A'}</p>
            
            <div className="mb-4">
              <p className="text-lg font-semibold text-blue-600">₹{scooter.pricePerHour || 0}/hour</p>
              {scooter.pricePerDay && <p className="text-md text-blue-500">₹{scooter.pricePerDay}/day</p>}
            </div>
          </div>
          
          <div className="md:w-2/3 p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rentalType">
                  Rental Type
                </label>
                <select
                  id="rentalType"
                  name="rentalType"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.rentalType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="hourly">Hourly</option>
                  {scooter.pricePerDay && <option value="daily">Daily</option>}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estimatedDuration">
                  Estimated Duration ({formData.rentalType === 'hourly' ? 'hours' : 'days'})
                </label>
                <input
                  type="number"
                  id="estimatedDuration"
                  name="estimatedDuration"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  min="1"
                  max={formData.rentalType === 'hourly' ? "24" : "30"}
                  step="0.5"
                  required
                />
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Estimated Cost</h3>
                <p className="text-2xl font-bold text-blue-600">₹{estimatedCost.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.rentalType === 'hourly' 
                    ? `${formData.estimatedDuration} hour(s) at ₹${scooter.pricePerHour}/hour`
                    : `${formData.estimatedDuration} day(s) at ₹${scooter.pricePerDay}/day`
                  }
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBooking;