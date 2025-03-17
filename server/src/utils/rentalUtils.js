/**
 * Utility functions for rental operations
 */

/**
 * Calculate duration between start and end time in user-friendly format
 * @param {Date} startTime - Rental start time
 * @param {Date} endTime - Rental end time (can be null for active rentals)
 * @returns {string} - Duration in user-friendly format
 */
export const calculateDuration = (startTime, endTime) => {
    if (!endTime) {
      // For active rentals, calculate duration until now
      endTime = new Date();
    }
    
    // Calculate duration in milliseconds
    const durationMs = endTime - startTime;
    
    // Convert to hours and minutes
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (durationHours === 0) {
      return `${durationMinutes} minutes`;
    } else if (durationMinutes === 0) {
      return `${durationHours} hour${durationHours > 1 ? 's' : ''}`;
    } else {
      return `${durationHours} hour${durationHours > 1 ? 's' : ''} ${durationMinutes} min`;
    }
  };
  
  /**
   * Calculate rental amount based on duration and price per hour
   * @param {number} durationInHours - Rental duration in hours
   * @param {number} pricePerHour - Price per hour for the scooter
   * @returns {number} - Total rental amount
   */
  export const calculateAmount = (durationInHours, pricePerHour) => {
    // Round up to the nearest 15 minutes (0.25 hours)
    const roundedDuration = Math.ceil(durationInHours * 4) / 4;
    
    // Calculate the base amount
    let amount = roundedDuration * pricePerHour;
    
    // Round to 2 decimal places
    return Math.round(amount * 100) / 100;
  };
  
  /**
   * Format date to display in UI
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date) => {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Generate CSV data for export
   * @param {Array} rentals - Array of rental objects
   * @returns {string} - CSV content
   */
  export const generateRentalCsv = (rentals) => {
    // Define CSV header
    const header = [
      'Rental ID',
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
      rental.id,
      rental.riderName,
      rental.scooterId,
      formatDate(rental.startTime),
      formatDate(rental.endTime),
      rental.duration,
      rental.amount,
      rental.status
    ]);
    
    // Combine header and rows
    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };