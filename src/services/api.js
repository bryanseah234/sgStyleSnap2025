/**
 * API Service - StyleSnap
 * 
 * Purpose: Central API client configuration and base HTTP methods
 * 
 * Features:
 * - Axios instance with base URL configuration
 * - Request interceptors (add auth token to headers)
 * - Response interceptors (handle errors globally)
 * - Base methods: get, post, put, delete
 * 
 * Configuration:
 * - Base URL: from environment variable (VITE_API_URL or Supabase URL)
 * - Timeout: 30 seconds
 * - Headers: Content-Type, Authorization (JWT token)
 * 
 * Error Handling:
 * - 401 Unauthorized: redirect to login
 * - 403 Forbidden: show permission error
 * - 404 Not Found: show not found error
 * - 500+ Server Error: show generic error message
 * 
 * Usage:
 * import api from './api'
 * const response = await api.get('/closet')
 * 
 * Note: All other service files (auth-service, clothes-service, etc.) use this API client
 * 
 * Reference:
 * - requirements/api-endpoints.md for all endpoints
 * - requirements/error-handling.md for error handling specs
 */

// TODO: Import axios
// TODO: Import Supabase client for auth token

// TODO: Create axios instance with base configuration
// TODO: Add request interceptor to include auth token
// TODO: Add response interceptor for error handling
// TODO: Export API methods (get, post, put, delete)

export default {
  // get, post, put, delete methods
}
