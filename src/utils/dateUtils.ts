/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a date string into a short date format (without time)
 * @param dateString - ISO date string
 * @returns Formatted short date string
 */
export const formatShortDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting short date:', error);
    return 'Invalid date';
  }
};

/**
 * Calculate time difference between two dates in a human-readable format
 * @param startDate - Start date string
 * @param endDate - End date string (defaults to now)
 * @returns Human-readable time difference
 */
export const getTimeDifference = (startDate: string, endDate?: string): string => {
  try {
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : Date.now();
    
    const diffMs = Math.abs(end - start);
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    if (diffHrs > 0) {
      return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
    }
    if (diffMins > 0) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return 'Unknown';
  }
}; 