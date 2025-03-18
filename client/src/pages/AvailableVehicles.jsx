import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axiosInstance from '../utils/axiosInstance';

// Component for image with fallback and loading state
const ScooterImage = ({ scooter }) => {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  console.log(scooter)
  // Get the backend URL - adjust this to match your backend server
  const BACKEND_URL = 'http://localhost:3000'; // Change this to your backend URL
  
  // Use the image from the scooter object if available, otherwise fall back to placeholder
  const imgSrc = imgError || !scooter?.image
    ? "/images/scooter-placeholder.jpg" 
    : `${BACKEND_URL}${scooter?.image}`;
  
  return (
    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={imgSrc}
        alt={`${scooter?.model} Scooter`}
        className={`w-full h-48 object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setImgError(true)}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

const AvailableVehicles = () => {
  const [scooters, setScooters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priceAsc');
  
  const navigate = useNavigate();
  const { user, isVerified } = useAuth();

  useEffect(() => {
    const fetchScooters = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/scooter/public', {
          params: {
            model: selectedModel !== 'All' ? selectedModel : undefined,
            search: searchQuery || undefined
          }
        });
        
        // Process the response data
        let scooterData = [];
        if (response.data && Array.isArray(response.data)) {
          scooterData = response.data;
        } else if (response.data && Array.isArray(response.data.scooters)) {
          scooterData = response.data.scooters;
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Failed to load available vehicles. Unexpected data format.');
          return;
        }
        
        setScooters(scooterData);
        
        // Extract unique models for filter dropdown
        const uniqueModels = [...new Set(scooterData.map(scooter => scooter.model))];
        setModels(uniqueModels);
      } catch (err) {
        console.error('Error fetching scooters:', err);
        setError(`Failed to load available vehicles: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchScooters();
  }, [selectedModel, searchQuery]);

  // Sort scooters based on selected option
  const sortedScooters = [...scooters].sort((a, b) => {
    switch (sortBy) {
      case 'priceAsc':
        return a.pricePerHour - b.pricePerHour;
      case 'priceDesc':
        return b.pricePerHour - a.pricePerHour;
      case 'modelAsc':
        return a.model.localeCompare(b.model);
      case 'modelDesc':
        return b.model.localeCompare(a.model);
      default:
        return 0;
    }
  });


  const handleBookNow = (scooterId) => {
    if (!user) {
      sessionStorage.setItem('bookingScooterId', scooterId);
      navigate('/login', { state: { redirectTo: '/available-vehicles', message: 'Please login to book a scooter' } });
      return;
    }

    if (user && !isVerified()) {
      navigate('/pending-verification');
      return;
    }

    navigate(`/booking/new`, { state: { scooterId } });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleClearFilters = () => {
    setSelectedModel('All');
    setSearchQuery('');
    setSortBy('priceAsc');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading available vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-lg w-full shadow-md">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold">Error Loading Vehicles</h3>
          </div>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Vehicles</h1>
              <p className="text-gray-600">{scooters.length} scooters ready for your next adventure</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
              {user && (
                <button 
                  onClick={() => navigate('/myBookings')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  My Bookings
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Search & Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by model or ID..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="model-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Model
              </label>
              <select
                id="model-filter"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedModel}
                onChange={handleModelChange}
              >
                <option value="All">All Models</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-by"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="modelAsc">Model: A to Z</option>
                <option value="modelDesc">Model: Z to A</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-right">
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Results section */}
        {sortedScooters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No vehicles available</h2>
            <p className="text-gray-500 max-w-md mx-auto">We couldn't find any vehicles matching your criteria. Please try adjusting your filters or check back later.</p>
            <button
              onClick={handleClearFilters}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedScooters.map((scooter) => (
              <div key={scooter.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  <ScooterImage scooter={scooter} />
                  <div className="absolute top-3 right-3 bg-green-500 text-white py-1 px-3 rounded-full text-sm font-medium shadow-md">
                    Available Now
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{scooter.model}</h3>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-500">ID: {scooter.scooterId}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-blue-600">₹{scooter.pricePerHour}</span>
                      <span className="text-sm text-gray-500">per hour</span>
                      {scooter.pricePerDay && (
                        <div className="mt-1 px-2 py-1 bg-blue-50 rounded text-xs text-green-600">
                          ₹{scooter.pricePerDay}/day
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional features section */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Easy booking</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Well maintained</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">24/7 support</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Free cancellation</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Book Now button */}
                  <button
                    onClick={() => handleBookNow(scooter.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center mt-2"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination section - can be implemented if needed */}
        {sortedScooters.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
        
        {/* Footer info section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Rental Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>A valid driver's license is required for all rentals. You must be at least 18 years old to rent a scooter.</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>Helmets are provided with all rentals and must be worn at all times while operating the vehicle.</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>Cancellations made 24 hours before rental start time are eligible for a full refund.</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>Fuel is included in the rental price. Please return the scooter with a similar fuel level.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableVehicles;