import React, { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { IoCalendarOutline } from 'react-icons/io5';
import ExportButton from '../components/common/ExportButton';

const IncentiveBonus = () => {
  const [incentives] = useState([
    {
      id: 1,
      riderName: 'John Doe',
      date: '2024-12-22',
      amount: 500,
      type: 'Peak Hour Bonus',
      criteria: '10+ rides in peak hours',
      status: 'Achieved'
    },
    {
      id: 2,
      riderName: 'Jane Smith',
      date: '2024-12-22',
      amount: 1000,
      type: 'Weekly Target',
      criteria: '50+ rides in a week',
      status: 'In Progress'
    },
    {
      id: 3,
      riderName: 'Mike Johnson',
      date: '2024-12-21',
      amount: 750,
      type: 'Special Event',
      criteria: 'Festival bonus',
      status: 'Expired'
    },
    // Add more incentive data as needed
  ]);

  const metrics = [
    {
      title: 'Total Incentives',
      value: '₹25,000',
      change: '+12.3%',
      changeType: 'increase',
      period: 'from last month'
    },
    {
      title: 'Active Riders',
      value: '1,293',
      change: '+5.3%',
      changeType: 'increase',
      period: 'from last week'
    },
    {
      title: 'Bonus Achieved',
      value: '789',
      change: '+8.8%',
      changeType: 'increase',
      period: 'from last month'
    }
  ];

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'achieved':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeStyle = (type) => {
    return type === 'increase' 
      ? 'text-green-600' 
      : 'text-red-600';
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Incentives & Bonus</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <IoCalendarOutline className="text-gray-500 mr-2" />
            <span>This Month</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Compare to</span>
            <select className="border rounded px-3 py-1.5 bg-white">
              <option>Last month</option>
              <option>Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm mb-2">{metric.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold">{metric.value}</span>
              <div className={`flex items-center ${getChangeStyle(metric.changeType)}`}>
                <span className="text-sm">{metric.change}</span>
                <span className="text-xs ml-1">{metric.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50">
            <FiFilter />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50">
            Type
          </button>
        </div>
        <ExportButton 
          data={incentives} 
          fileName="incentives_data" 
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-600">Rider Name</th>
                <th className="text-left p-4 font-medium text-gray-600">Date</th>
                <th className="text-left p-4 font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 font-medium text-gray-600">Type</th>
                <th className="text-left p-4 font-medium text-gray-600">Criteria</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {incentives.map((incentive) => (
                <tr key={incentive.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{incentive.riderName}</td>
                  <td className="p-4">{new Date(incentive.date).toLocaleDateString()}</td>
                  <td className="p-4">₹{incentive.amount}</td>
                  <td className="p-4">{incentive.type}</td>
                  <td className="p-4">{incentive.criteria}</td>
                  <td className="p-4">
                    <span className={`${getStatusStyle(incentive.status)} px-3 py-1 rounded-full text-sm`}>
                      {incentive.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t text-sm text-gray-500 flex justify-between items-center">
          <span>Showing 1-09 of 45</span>
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

export default IncentiveBonus;
