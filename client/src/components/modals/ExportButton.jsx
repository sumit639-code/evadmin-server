import React from 'react';
import { generateRentalCsv, downloadCsv } from '../../utils/rentalUtils';

/**
 * Export Button component for rental data
 * @param {Object} props - Component props
 * @param {Array} props.data - Rental data to export
 * @param {string} props.fileName - Base name for the exported file (without extension)
 * @returns {JSX.Element} - Export button component
 */
const ExportData = ({ data = [], fileName = 'rental-data' }) => {
  const handleExport = () => {
    // Generate CSV from rental data
    const csvContent = generateRentalCsv(data);
    
    // Download the CSV file
    downloadCsv(csvContent, fileName);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800"
      disabled={!data || data.length === 0}
    >
      Export Data
    </button>
  );
};

export default ExportData;