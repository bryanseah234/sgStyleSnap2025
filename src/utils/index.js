/**
 * StyleSnap - Utility Functions
 * 
 * Collection of utility functions used throughout the application
 * for common operations like URL generation, date formatting, and
 * performance optimization.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

/**
 * Creates a page URL for navigation based on page name
 * 
 * Maps page names to their corresponding route paths for consistent
 * navigation throughout the application.
 * 
 * @param {string} pageName - The name of the page to navigate to
 * @returns {string} The URL path for the specified page
 * 
 * @example
 * createPageUrl('Home') // Returns '/'
 * createPageUrl('Cabinet') // Returns '/cabinet'
 * createPageUrl('InvalidPage') // Returns '/' (fallback)
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
 * Formats a date to a human-readable string
 * 
 * Converts a Date object or date string into a formatted string
 * using the US locale format (e.g., "Jan 15, 2024").
 * 
 * @param {Date|string} date - The date to format (Date object or ISO string)
 * @returns {string} Formatted date string in US locale format
 * 
 * @example
 * formatDate(new Date()) // Returns "Jan 15, 2024"
 * formatDate('2024-01-15T10:30:00Z') // Returns "Jan 15, 2024"
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
 * Generates a unique identifier
 * 
 * Creates a unique string ID by combining the current timestamp
 * with a random string. Useful for generating temporary IDs
 * for UI elements or temporary data.
 * 
 * @returns {string} A unique identifier string
 * 
 * @example
 * generateId() // Returns something like "1a2b3c4d5e6f"
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Debounces a function call to improve performance
 * 
 * Returns a new function that delays execution until after
 * the specified wait time has passed since the last invocation.
 * Useful for search inputs, resize handlers, and other events
 * that fire frequently.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} The debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * // Only executes after 300ms of no calls
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this will execute
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

/**
 * Extracts the first name from a full name
 * 
 * Splits a full name string on spaces and returns the first part.
 * Useful for displaying first names only in friend-related UI elements
 * while keeping full names for the Friends page and Friend Profile page.
 * 
 * @param {string} fullName - The full name to extract from
 * @returns {string} The first name, or empty string if input is invalid
 * 
 * @example
 * getFirstName('John Doe') // Returns 'John'
 * getFirstName('Jane') // Returns 'Jane'
 * getFirstName('') // Returns ''
 * getFirstName(null) // Returns ''
 */
export function getFirstName(fullName) {
  if (!fullName) return ''
  return fullName.split(' ')[0]
}
