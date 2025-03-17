import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopData = () => {
  const [stats, setStats] = useState({
    totalRevenue: { amount: 0, percentChange: 0, increased: true },
    income: { amount: 0, percentChange: 0, increased: true },
    expenses: { amount: 0, percentChange: 0, increased: true }
  });
  const [isLoading, setIsLoading] = useState(true);

  // API base URL - adjust this to match your setup
  const API_URL = 'http://localhost:3000/api';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/scooter/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex gap-5'>
      <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
        <p>Total Revenue</p>
        <div className='flex items-center justify-between py-1'>
          <h2 className='text-4xl font-semibold'>
            {isLoading ? 'Loading...' : `₹${stats.totalRevenue.amount}`}
          </h2>
          <img src="/icons/Icon1.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
        </div>
        <p className=''>
          <span className={stats.totalRevenue.increased ? 'text-[#81DE3B]' : 'text-red-500'}>
            {isLoading ? '' : `${Math.abs(stats.totalRevenue.percentChange)}% `}
          </span>
          {isLoading ? '' : (stats.totalRevenue.increased ? 'more' : 'less')} from yesterday
        </p>
      </div>

      <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
        <p>Income</p>
        <div className='flex items-center justify-between py-1'>
          <h2 className='text-4xl font-semibold'>
            {isLoading ? 'Loading...' : `₹${stats.income.amount}`}
          </h2>
          <img src="/icons/Icon2.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
        </div>
        <p className=''>
          <span className={stats.income.increased ? 'text-[#81DE3B]' : 'text-red-500'}>
            {isLoading ? '' : `${Math.abs(stats.income.percentChange)}% `}
          </span>
          {isLoading ? '' : (stats.income.increased ? 'more' : 'less')} from yesterday
        </p>
      </div>

      <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
        <p>Expenses</p>
        <div className='flex items-center justify-between py-1'>
          <h2 className='text-4xl font-semibold'>
            {isLoading ? 'Loading...' : `₹${stats.expenses.amount}`}
          </h2>
          <img src="/icons/Icon3.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
        </div>
        <p className=''>
          <span className={!stats.expenses.increased ? 'text-[#81DE3B]' : 'text-red-500'}>
            {isLoading ? '' : `${Math.abs(stats.expenses.percentChange)}% `}
          </span>
          {isLoading ? '' : (stats.expenses.increased ? 'more' : 'less')} from yesterday
        </p>
      </div>
    </div>
  );
};

export default TopData;