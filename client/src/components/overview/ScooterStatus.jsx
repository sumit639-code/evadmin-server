import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown } from 'lucide-react';

const scooterData = [
  { no: '558612', vehicleNo: 's_40110', customer: 'Pásztor Kíra', status: 'On road' },
  { no: '267400', vehicleNo: 'GPSPE-905', customer: 'László Barbara', status: 'Offline' },
  { no: '449003', vehicleNo: 'OBD_38653', customer: 'Pintér Beatrix', status: 'In maintenance' },
  { no: '487441', vehicleNo: 'ET200-228', customer: 'Virág Mercédesz', status: 'On road' },
];

const StatusBadge = ({ status }) => {
  const colors = {
    'On road': 'bg-green-100 text-green-800',
    'Offline': 'bg-gray-100 text-gray-800',
    'In maintenance': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
};

export default function ScooterStatus() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalItems = 78;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 lg:p-8 max-w-full lg:max-w-3xl mx-auto overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Live Scooter Status</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <SlidersHorizontal className="w-5 h-5 inline-block mr-1" />
            Filters
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Status
            <ChevronDown className="w-5 h-5 inline-block ml-1" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle no.</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scooterData.map((scooter) => (
              <tr key={scooter.no}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scooter.no}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{scooter.vehicleNo}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{scooter.customer}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <StatusBadge status={scooter.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
