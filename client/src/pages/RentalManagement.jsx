import React, { useState, useEffect } from 'react';
import { FiFilter } from 'react-icons/fi';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDate, calculateDuration } from '../utils/rentalUtility';
import axiosInstance from '../utils/axiosInstance';
import TimeFrame from '../components/common/TimeFrame';
import CreateRentalModal from '../components/common/CreateRentalModal';
import RentalDetailModal from '../components/common/RentalDetailModal';

const RentalManagement = () => {
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: 'All Status',
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [stats, setStats] = useState({
    todayRentals: 0,
    activeRentals: 0,
    completedToday: 0,
    todayRevenue: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchRentals();
    fetchRentalStats();
  }, [filters, currentPage]);

  const fetchRentalStats = async () => {
    try {
      const response = await axiosInstance.get('/rental/stats');
      setStats({
        todayRentals: response.data.stats.today.totalRentals || 0,
        activeRentals: response.data.stats.today.activeRentals || 0,
        completedToday: response.data.stats.today.completedRentals || 0,
        todayRevenue: response.data.stats.today.revenue || 0
      });
    } catch (error) {
      console.error('Error fetching rental stats:', error);
      // Keep default values on error
    }
  };

  const fetchRentals = async () => {
    setIsLoading(true);
    try {
      // Build query params for filtering
      const params = new URLSearchParams();
      
      if (filters.status !== 'All Status') {
        params.append('status', filters.status);
      }
      
      // Add pagination parameters
      params.append('page', currentPage);
      params.append('pageSize', pageSize);

      const response = await axiosInstance.get(`/rental?${params.toString()}`);
      setRentals(response.data.rentals || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast.error('Failed to load rental data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, status: e.target.value });
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handleCreateRental = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSuccess = (newRental) => {
    setCreateModalOpen(false);
    fetchRentals();
    fetchRentalStats();
    toast.success('New rental created successfully');
  };

  const handleRowClick = (rental) => {
    setSelectedRental(rental);
    setDetailModalOpen(true);
  };

  const handleCompleteRental = async (id) => {
    try {
      await axiosInstance.put(`/rental/${id}/complete`, {
        endTime: new Date().toISOString()
      });
      
      toast.success('Rental completed successfully');
      setDetailModalOpen(false);
      fetchRentals();
      fetchRentalStats();
    } catch (error) {
      console.error('Error completing rental:', error);
      toast.error(error.response?.data?.message || 'Failed to complete rental');
    }
  };

  const handleCancelRental = async (id) => {
    try {
      await axiosInstance.put(`/rental/${id}/cancel`);
      
      toast.success('Rental cancelled successfully');
      setDetailModalOpen(false);
      fetchRentals();
      fetchRentalStats();
    } catch (error) {
      console.error('Error cancelling rental:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel rental');
    }
  };

  const handleExportData = () => {
    // Implementation for exporting data
    if (rentals.length === 0) {
      toast.info('No data to export');
      return;
    }

    // Generate CSV content
    const headers = ["Rider Name", "Scooter ID", "Start Time", "End Time", "Duration", "Amount", "Status"];
    const csvRows = [
      headers.join(","),
      ...rentals.map(rental => [
        rental.riderName || "check",
        rental.scooterId,
        formatDate(rental.startTime),
        formatDate(rental.endTime) || "-",
        calculateDuration(rental.startTime, rental.endTime),
        rental.amount ? `₹${rental.amount}` : "-",
        rental.status
      ].join(","))
    ];
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rental-data-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Data exported successfully');
  };

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

  // Calculate pagination details
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="flex mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Rental Management</h1>
        </div>
        <div className="absolute right-[27px]">
          <TimeFrame />
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border border-gray-300 p-4 rounded-lg bg-white">
          <p className="text-gray-600 text-sm">Today's Rentals</p>
          <p className="text-xl font-semibold">{stats.todayRentals}</p>
        </div>
        <div className="border border-gray-300 p-4 rounded-lg bg-white">
          <p className="text-gray-600 text-sm">Active Rentals</p>
          <p className="text-xl font-semibold">{stats.activeRentals}</p>
        </div>
        <div className="border border-gray-300 p-4 rounded-lg bg-white">
          <p className="text-gray-600 text-sm">Completed Today</p>
          <p className="text-xl font-semibold">{stats.completedToday}</p>
        </div>
        <div className="border border-gray-300 p-4 rounded-lg bg-white">
          <p className="text-gray-600 text-sm">Today's Revenue</p>
          <p className="text-xl font-semibold">₹{stats.todayRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <FiFilter className="h-4 w-4 mr-2" />
            Filters
          </button>

          <select
            value={filters.status}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md text-sm py-2 px-3 text-gray-700 bg-white hover:bg-gray-50"
          >
            <option value="All Status">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCreateRental}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Rental
          </button>

          <button
            onClick={handleExportData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Rentals table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rider Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scooter ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : rentals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    No rentals found
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(rental)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rental.riderName || 'check'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rental.scooterId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rental.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rental.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateDuration(rental.startTime, rental.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rental.amount ? `₹${rental.amount}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(rental.status)}`}>
                        {rental.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              {isLoading ? (
                'Loading...'
              ) : (
                `Showing ${rentals.length === 0 ? 0 : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)}`} of ${totalCount}`
              )}
            </div>
            <div className="flex space-x-2">
              <button
                className="inline-flex items-center p-1 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                className="inline-flex items-center p-1 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || isLoading}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Rental Modal */}
      {createModalOpen && (
        <CreateRentalModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Rental Detail Modal */}
      {detailModalOpen && selectedRental && (
        <RentalDetailModal
          rental={selectedRental}
          onClose={() => setDetailModalOpen(false)}
          onComplete={handleCompleteRental}
          onCancel={handleCancelRental}
        />
      )}
    </div>
  );
};

export default RentalManagement;