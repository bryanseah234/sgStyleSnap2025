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

import axios from 'axios'
import { supabase } from '../config/supabase'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token to headers
api.interceptors.request.use(
  async config => {
    // Get current session
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('Unauthorized access. Redirecting to login...')
          window.location.href = '/login'
          break

        case 403:
          // Forbidden - permission error
          console.error('Permission denied:', data.message || 'Access forbidden')
          break

        case 404:
          // Not found
          console.error('Resource not found:', data.message || 'Not found')
          break

        case 500:
        case 502:
        case 503:
          // Server errors
          console.error('Server error:', data.message || 'Something went wrong')
          break

        default:
          console.error('API error:', data.message || error.message)
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server')
    } else {
      // Something else happened
      console.error('Request error:', error.message)
    }

    return Promise.reject(error)
  }
)

// Export API methods
export default {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config)
}
