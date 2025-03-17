/**
 * Utility functions for rental operations
 */

/**
 * Calculate duration between start and end time in user-friendly format
 * @param {Date|string} startTime - Rental start time
 * @param {Date|string} endTime - Rental end time (can be null for active rentals)
 * @returns {string} - Duration in "X hour Y min" format
 */
export const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '-';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Calculate the difference in milliseconds
    const diffMs = end - start;
    
    // If the difference is negative (end date before start date)
    if (diffMs < 0) {
      const absDiffMs = Math.abs(diffMs);
      const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
      const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      // Format properly with a single negative sign
      return `${hours} hour ${minutes} min`;
    }
    
    // Calculate hours and minutes for positive duration
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} hour ${minutes} min`;
  };
  
  /**
   * Calculate rental amount based on duration and price per hour
   * @param {number} durationInHours - Rental duration in hours
   * @param {number} pricePerHour - Price per hour for the scooter
   * @returns {number} - Total rental amount
   */
  export const calculateAmount = (durationInHours, pricePerHour) => {
    // Handle negative duration for cancelled rentals
    const absoluteDuration = Math.abs(durationInHours);
    
    // Round up to the nearest 15 minutes (0.25 hours)
    const roundedDuration = Math.ceil(absoluteDuration * 4) / 4;
    
    // Calculate the base amount
    let amount = roundedDuration * pricePerHour;
    
    // Round to 2 decimal places
    return Math.round(amount * 100) / 100;
  };
  
  /**
   * Format date to display in UI
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted date string in MM/DD/YYYY, HH:MM AM/PM format
   */
  export const formatDate = (date) => {
    if (!date) return '-';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  /**
   * Generate CSV data for export
   * @param {Array} rentals - Array of rental objects
   * @returns {string} - CSV content
   */
  export const generateRentalCsv = (rentals) => {
    if (!rentals || rentals.length === 0) {
      return 'No data available for export';
    }
    
    // Define CSV header
    const header = [
      'Rider Name',
      'Scooter ID',
      'Start Time',
      'End Time',
      'Duration',
      'Amount (₹)',
      'Status'
    ];
    
    // Map rentals to CSV rows
    const rows = rentals.map(rental => [
      rental.riderName || 'Unknown',
      rental.scooterId || '',
      formatDate(rental.startTime),
      formatDate(rental.endTime),
      calculateDuration(rental.startTime, rental.endTime),
      rental.amount ? rental.amount : '-',
      rental.status || ''
    ]);
    
    // Combine header and rows
    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };
  
  /**
   * Create a downloadable CSV file
   * @param {string} csvContent - CSV content as string
   * @param {string} fileName - Name for the download file
   */
  export const downloadCsv = (csvContent, fileName = 'rental-data') => {
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
    
    // Append the link to the document body
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };