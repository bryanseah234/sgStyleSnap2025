// Utility functions for the StyleSnap app

/**
 * Creates a page URL for navigation
 * @param {string} pageName - The name of the page
 * @returns {string} The URL path for the page
 */
export function createPageUrl(pageName) {
  const pageMap = {
    'Home': '/',
    'Cabinet': '/cabinet',
    'Dashboard': '/dashboard',
    'Friends': '/friends',
    'Profile': '/profile',
    'FriendCabinet': '/friend-cabinet'
  };
  
  return pageMap[pageName] || '/';
}

/**
 * Formats a date to a readable string
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Generates a unique ID
 * @returns {string} A unique identifier
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}