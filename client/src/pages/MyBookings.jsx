import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { format } from 'date-fns';
import { Tab } from '@headlessui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(`/bookings?userId=${user.id}`);
      setBookings(response.data.bookings);
      
      // Filter bookings by status
      const active = response.data.bookings.filter(
        booking => booking.status === 'IN_PROGRESS'
      );
      
      const past = response.data.bookings.filter(
        booking => booking.status === 'COMPLETED' || booking.status === 'CANCELLED'
      );
      
      setActiveBookings(active);
      setPastBookings(past);
      
    } catch (err) {
      console.error('Error fetching bookings', err);
      setError('Failed to load your bookings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      
      const response = await axiosInstance.put(`/bookings/${bookingId}/status`, {
        status: 'CANCELLED'
      });
      
      if (response.status === 200) {
        toast.success('Booking cancelled successfully');
        
        // Update local state
        setActiveBookings(prevBookings => 
          prevBookings.filter(booking => booking.id !== bookingId)
        );
        
        setPastBookings(prevBookings => [
          ...prevBookings, 
          {...bookings.find(b => b.id === bookingId), status: 'CANCELLED'}
        ]);
        
        // Refresh bookings
        fetchBookings();
      }
    } catch (err) {
      console.error('Error cancelling booking', err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (err) {
      return 'Invalid date';
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return 'In progress';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    // Convert to hours
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBookingCard = (booking) => {
    const statusClass = getStatusColor(booking.status);
    const isActive = booking.status === 'IN_PROGRESS';
    
    return (
      <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {booking.scooter.model} - {booking.scooter.scooterId}
              </h3>
              <p className="text-sm text-gray-500">
                Booking ID: {booking.id}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
              {booking.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Start Time</p>
              <p className="text-sm font-medium">{formatDateTime(booking.startTime)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">End Time</p>
              <p className="text-sm font-medium">
                {booking.endTime ? formatDateTime(booking.endTime) : 'Not completed'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-medium">
                {calculateDuration(booking.startTime, booking.endTime)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-sm font-medium">
                {booking.transactions && booking.transactions.length > 0 
                  ? `₹${booking.transactions[0].amount}` 
                  : 'Not charged yet'}
              </p>
            </div>
          </div>
        </div>
        
        {isActive && (
          <div className="p-4 bg-gray-50 flex justify-end">
            <button 
              onClick={() => cancelBooking(booking.id)}
              disabled={cancellingId === booking.id}
              className={`px-4 py-2 text-sm rounded-md ${
                cancellingId === booking.id
                  ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchBookings}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
            <button
              onClick={() => navigate('/booking/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Book a Scooter
            </button>
          </div>
        ) : (
          <Tab.Group>
            <Tab.List className="flex bg-white rounded-lg p-1 mb-4 shadow-sm">
              <Tab
                className={({ selected }) =>
                  `w-full py-2.5 text-sm font-medium leading-5 rounded-md focus:outline-none focus:ring-0 ${
                    selected
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Active Bookings ({activeBookings.length})
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full py-2.5 text-sm font-medium leading-5 rounded-md focus:outline-none focus:ring-0 ${
                    selected
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Past Bookings ({pastBookings.length})
              </Tab>
            </Tab.List>
            
            <Tab.Panels>
              <Tab.Panel>
                {activeBookings.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">You don't have any active bookings.</p>
                    <button
                      onClick={() => navigate('/booking/new')}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                    >
                      Book a Scooter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeBookings.map(booking => renderBookingCard(booking))}
                  </div>
                )}
              </Tab.Panel>
              
              <Tab.Panel>
                {pastBookings.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">You don't have any past bookings.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map(booking => renderBookingCard(booking))}
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
    </div>
  );
};

export default MyBookings;