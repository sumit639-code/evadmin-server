import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { ChevronDown } from "lucide-react";

const allData = {
  "7 Days": [
    { day: "Mon", revenue: 20000, expenses: 18000 },
    { day: "Tue", revenue: 22000, expenses: 8000 },
    { day: "Wed", revenue: 19000, expenses: 16000 },
    { day: "Thu", revenue: 23000, expenses: 30000 },
    { day: "Fri", revenue: 31000, expenses: 22000 },
    { day: "Sat", revenue: 19000, expenses: 30000 },
    { day: "Sun", revenue: 25000, expenses: 1000 },
  ],
  "30 Days": Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    revenue: Math.floor(Math.random() * 40000) + 10000,
    expenses: Math.floor(Math.random() * 30000) + 5000,
  })),
  "3 Months": Array.from({ length: 90 }, (_, i) => ({
    day: `Day ${i + 1}`,
    revenue: Math.floor(Math.random() * 50000) + 15000,
    expenses: Math.floor(Math.random() * 40000) + 10000,
  })),
};

export default function RevenueExpenses() {
  const [selectedRange, setSelectedRange] = useState("7 Days");
  const [isOpen, setIsOpen] = useState(false);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Revenue and Expenses
        </h2>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-40 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span>{selectedRange}</span>
            <ChevronDown
              className="w-5 h-5 ml-2 -mr-1 text-gray-400"
              aria-hidden="true"
            />
          </button>
          {isOpen && (
            <div className="absolute right-0 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                {Object.keys(allData).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={allData[selectedRange]}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              interval={"preserveStartEnd"}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
              itemStyle={{ color: "#666" }}
              formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
            />
            {/* Area for revenue in green */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              fillOpacity={0.3}
              dot={false}
              activeDot={{ r: 8, strokeWidth: 0, fill: "#22c55e" }}
            />
            {/* Line for expenses in red */}
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8, strokeWidth: 0, fill: "#ef4444" }}
            />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
