import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TimeFrame() {
  const [selectedPeriod, setSelectedPeriod] = useState("Previous Period");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  return (
    <div className="flex items-center gap-2">
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        customInput={
          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Today
          </button>
        }
      />

      <span>Compared to</span>

      {selectedPeriod !== "Today" && (
        <DatePicker
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        customInput={
          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <span>{selectedPeriod}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        }
        selectsRange
        startDate={startDate}
        endDate={endDate}
      />
      
      )}
    </div>
  );
}
