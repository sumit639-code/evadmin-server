import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Feb', users: 1000 },
  { month: 'Mar', users: 1500 },
  { month: 'Apr', users: 3000 },
  { month: 'May', users: 2800 },
  { month: 'June', users: 1000 },
  { month: 'July', users: 1800 },
  { month: 'Aug', users: 3000 },
  { month: 'Sept', users: 2300 },
];

const ActiveUsers = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    setChartData(data);
  }, []);

  return (
    <div className="max-w-3xl mx-auto shadow-lg bg-white rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-bold">Active Users</h2>
      </div>
      <div className="h-[162px]"> {/* Set the height to 232px */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: '#333', fontWeight: 'bold' }}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              fill="url(#colorGradient)"
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActiveUsers;
