import React, { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { IoCalendarOutline } from 'react-icons/io5';

const InsuranceManagement = () => {
  const [claims] = useState([
    {
      scooter: 'TMX-04',
      description: "The world's largest e-store, has returned more than 7...",
      status: 'On road'
    },
    {
      scooter: 'TMG-07',
      description: 'The social media maestro, owner of Instagram, What...',
      status: 'On road'
    },
    {
      scooter: 'TMY-03',
      description: 'The sole product manufacturer of the group, has retu...',
      status: 'On road'
    },
    {
      scooter: 'TMX-01',
      description: 'Google — parent company Alphabet (GOOG, GOOG...',
      status: 'On road'
    },
    {
      scooter: 'TMY-01',
      description: 'The sole product manufacturer of the group, has retu...',
      status: 'On road'
    },
    {
      scooter: 'TMY-01',
      description: 'The sole product manufacturer of the group, has retu...',
      status: 'On road'
    },
    {
      scooter: 'TM-X07',
      description: 'The superpower of streaming, has returned 72% fro...',
      status: 'On road'
    },
    {
      scooter: 'TM-X07',
      description: 'The superpower of streaming, has returned 72% fro...',
      status: 'On road'
    },
    {
      scooter: 'TMX-08',
      description: "The world's largest e-store, has returned more than 7...",
      status: 'On road'
    }
  ]);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'on road':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Insurance Management</h1>
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
          Scooter
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50">
          Status
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-600">Scooter</th>
                <th className="text-left p-4 font-medium text-gray-600">Claim Description</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-4">{claim.scooter}</td>
                  <td className="p-4 text-gray-600">{claim.description}</td>
                  <td className="p-4">
                    <span className={`${getStatusStyle(claim.status)} px-3 py-1 rounded-full text-sm`}>
                      {claim.status}
                    </span>
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
    </div>
  );
};

export default InsuranceManagement;
