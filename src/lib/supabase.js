/**
 * StyleSnap - Supabase Client Configuration
 * 
 * Configures and exports the Supabase client with authentication settings
 * and provides utility functions for error handling and user management.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Supabase Client Instance
 * 
 * Creates and configures the Supabase client with authentication settings
 * for automatic token refresh, session persistence, and URL session detection.
 * 
 * @type {SupabaseClient} Configured Supabase client instance
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,    // Automatically refresh expired tokens
    persistSession: true,      // Persist session in localStorage
    detectSessionInUrl: true   // Detect session from URL parameters
  }
})

/**
 * Handles Supabase errors with user-friendly messages
 * 
 * Converts Supabase error codes and messages into user-friendly error messages
 * for better error handling throughout the application.
 * 
 * @param {Error} error - The Supabase error object
 * @param {string} operation - Description of the operation that failed
 * @throws {Error} User-friendly error message
 * 
 * @example
 * try {
 *   const { data, error } = await supabase.from('users').select('*')
 *   if (error) handleSupabaseError(error, 'fetch users')
 * } catch (error) {
 *   console.error(error.message) // "No data found" instead of "PGRST116"
 * }
 */
export function handleSupabaseError(error, operation = 'operation') {
  console.error(`Supabase ${operation} error:`, error)
  
  // Handle specific Supabase error codes
  if (error.code === 'PGRST116') {
    throw new Error('No data found')
  } else if (error.code === '23505') {
    throw new Error('Item already exists')
  } else if (error.code === '23503') {
    throw new Error('Referenced item not found')
  } else if (error.message?.includes('JWT')) {
    throw new Error('Authentication required')
  } else if (error.message?.includes('permission')) {
    throw new Error('Permission denied')
  }
  
  // Fallback to original error message or generic message
  throw new Error(error.message || `Failed to ${operation}`)
}

/**
 * Gets the current authenticated user
 * 
 * Fetches the current user from Supabase Auth. Returns null if no user
 * is authenticated.
 * 
 * @returns {Promise<Object|null>} Current user object or null
 * @throws {Error} If there's an error fetching the user
 * 
 * @example
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log('User is authenticated:', user.email)
 * } else {
 *   console.log('No user is authenticated')
 * }
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

/**
 * Gets the current user's profile from the database
 * 
 * Fetches the user's profile data from the users table. Requires
 * the user to be authenticated.
 * 
 * @returns {Promise<Object>} User profile object
 * @throws {Error} If user is not authenticated or profile fetch fails
 * 
 * @example
 * const profile = await getCurrentUserProfile()
 * console.log('User profile:', profile.name, profile.email)
 */
export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) handleSupabaseError(error, 'get user profile')
  return data
}
