import React, { useState } from 'react';
import { FiFilter, FiArrowDown, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IoCalendarOutline, IoSettingsOutline } from 'react-icons/io5';
import { TbChartLine } from 'react-icons/tb';
import { HiOutlineDocumentArrowUp } from 'react-icons/hi2';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const IncentiveAndBonus = () => {
  const [riders] = useState([
    { id: '01906912', name: 'Bessie Cooper', earnings: '₹3000.00', bonusType: 'Performance based', amount: '₹250', status: 'Paid' },
    { id: '76031847', name: 'Jerome Bell', earnings: '₹1500.00', bonusType: 'Referral Based', amount: '₹110', status: 'Pending' },
    { id: '37890606', name: 'Kathryn Murphy', earnings: '₹1500.00', bonusType: 'Loyalty', amount: '₹85', status: 'Pending' },
    { id: '66277431', name: 'Darlene Robertson', earnings: '₹2000.00', bonusType: 'Loyalty', amount: '₹210', status: 'Under review' },
    { id: '29103050', name: 'Devon Lane', earnings: '₹3500.00', bonusType: 'Performance based', amount: '₹175', status: 'Paid' },
  ]);

  const [topRiders] = useState([
    { name: 'Theresa Webb', avatar: '👤' },
    { name: 'Marvin McKin', avatar: '👤' },
    { name: 'Kristin Watson', avatar: '👤' },
    { name: 'Arlene McCoy', avatar: '👤' },
  ]);

  const chartData = [
    { month: 'Jan', value: 200 },
    { month: 'Feb', value: 250 },
    { month: 'Mar', value: 230 },
    { month: 'Apr', value: 280 },
    { month: 'May', value: 300 },
    { month: 'Jun', value: 250 },
  ];

  const getBonusTypeStyle = (type) => {
    switch (type.toLowerCase()) {
      case 'performance based':
        return 'bg-yellow-100 text-yellow-800';
      case 'referral based':
        return 'bg-green-100 text-green-800';
      case 'loyalty':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under review':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Incentive and Bonuses</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white">
            <IoSettingsOutline />
            Configure Bonus and Incentives
          </button>
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

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Total Bonuses Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 mb-2">Total Bonuses Distributed</p>
              <h2 className="text-3xl font-semibold">₹9000</h2>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <TbChartLine className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center text-red-500 text-sm">
            <FiArrowDown className="mr-1" />
            <span>4.3% Down from yesterday</span>
          </div>
        </div>

        {/* Top Riders Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-4">Top Ryders</p>
          <div className="grid grid-cols-2 gap-4">
            {topRiders.map((rider, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-2xl">{rider.avatar}</span>
                <span className="text-sm">{rider.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4CAF50" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Ryders Bonus Management table</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white">
              <FiFilter />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white">
              City
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white">
              Ride count
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white">
              Earnings
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded bg-white">
              Incentive type
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by Ryder name, ID, Phone no..."
              className="px-4 py-2 border rounded-lg w-64"
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              <HiOutlineDocumentArrowUp />
              Export Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Ryder ID</th>
                  <th className="text-left p-4 font-medium text-gray-600">Ryder Name</th>
                  <th className="text-left p-4 font-medium text-gray-600">Total Earnings</th>
                  <th className="text-left p-4 font-medium text-gray-600">Bonus/Incentive type</th>
                  <th className="text-left p-4 font-medium text-gray-600">Bonus amount</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((rider) => (
                  <tr key={rider.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{rider.id}</td>
                    <td className="p-4">{rider.name}</td>
                    <td className="p-4">{rider.earnings}</td>
                    <td className="p-4">
                      <span className={`${getBonusTypeStyle(rider.bonusType)} px-3 py-1 rounded-full text-sm`}>
                        {rider.bonusType}
                      </span>
                    </td>
                    <td className="p-4">{rider.amount}</td>
                    <td className="p-4">
                      <span className={`${getStatusStyle(rider.status)} px-3 py-1 rounded-full text-sm`}>
                        {rider.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <FiEdit2 className="text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <FiTrash2 className="text-gray-600" />
                        </button>
                      </div>
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
    </div>
  );
};

export default IncentiveAndBonus;
