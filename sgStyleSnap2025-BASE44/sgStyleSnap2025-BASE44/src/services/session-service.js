/**
 * Session Management Service - StyleSnap
 *
 * Purpose: Manages user sessions and provides session switching functionality
 *
 * Features:
 * - Store and retrieve user sessions
 * - Check for existing sessions
 * - Switch between user accounts
 * - Clear sessions when needed
 * - Single user enforcement (only one active session at a time)
 */

import { supabase } from '@/lib/supabase'

const SESSION_STORAGE_KEY = 'stylesnap_user_sessions'
const ACTIVE_SESSION_KEY = 'stylesnap_active_session'

/**
 * Get all stored user sessions
 * @returns {Array} Array of user session objects
 */
export function getStoredSessions() {
  try {
    const sessions = localStorage.getItem(SESSION_STORAGE_KEY)
    return sessions ? JSON.parse(sessions) : []
  } catch (error) {
    console.error('Failed to get stored sessions:', error)
    return []
  }
}

/**
 * Store a new user session
 * @param {Object} userData - User data from Supabase auth
 * @returns {Object} Stored session object
 */
export function storeUserSession(userData) {
  try {
    const sessions = getStoredSessions()
    
    // Create session object
    const session = {
      id: userData.id,
      email: userData.email,
      name: userData.user_metadata?.name || userData.email?.split('@')[0] || 'User',
      avatar_url: userData.user_metadata?.avatar_url || null,
      last_login: new Date().toISOString(),
      provider: userData.app_metadata?.provider || 'google'
    }
    
    // Remove existing session for this user (if any)
    const filteredSessions = sessions.filter(s => s.id !== userData.id)
    
    // Add new session at the beginning
    const updatedSessions = [session, ...filteredSessions].slice(0, 5) // Keep only last 5 sessions
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSessions))
    
    // Set as active session
    setActiveSession(session)
    
    return session
  } catch (error) {
    console.error('Failed to store user session:', error)
    return null
  }
}

/**
 * Set the currently active session
 * @param {Object} session - Session object to set as active
 */
export function setActiveSession(session) {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to set active session:', error)
  }
}

/**
 * Get the currently active session
 * @returns {Object|null} Active session object or null
 */
export function getActiveSession() {
  try {
    const session = localStorage.getItem(ACTIVE_SESSION_KEY)
    return session ? JSON.parse(session) : null
  } catch (error) {
    console.error('Failed to get active session:', error)
    return null
  }
}

/**
 * Clear the active session
 */
export function clearActiveSession() {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  } catch (error) {
    console.error('Failed to clear active session:', error)
  }
}

/**
 * Remove a specific session from storage
 * @param {string} userId - User ID to remove
 */
export function removeUserSession(userId) {
  try {
    const sessions = getStoredSessions()
    const updatedSessions = sessions.filter(s => s.id !== userId)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSessions))
    
    // If this was the active session, clear it
    const activeSession = getActiveSession()
    if (activeSession && activeSession.id === userId) {
      clearActiveSession()
    }
  } catch (error) {
    console.error('Failed to remove user session:', error)
  }
}

/**
 * Clear all stored sessions
 */
export function clearAllSessions() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  } catch (error) {
    console.error('Failed to clear all sessions:', error)
  }
}

/**
 * Check if user has any stored sessions
 * @returns {boolean} True if user has stored sessions
 */
export function hasStoredSessions() {
  const sessions = getStoredSessions()
  return sessions.length > 0
}

/**
 * Get the most recent session (excluding current user if provided)
 * @param {string} excludeUserId - User ID to exclude from results
 * @returns {Object|null} Most recent session or null
 */
export function getMostRecentSession(excludeUserId = null) {
  const sessions = getStoredSessions()
  const filteredSessions = excludeUserId 
    ? sessions.filter(s => s.id !== excludeUserId)
    : sessions
  
  return filteredSessions.length > 0 ? filteredSessions[0] : null
}

/**
 * Switch to a different user session
 * @param {Object} session - Session to switch to
 * @returns {Promise<Object>} New user data
 */
export async function switchToSession(session) {
  try {
    // Clear current session
    await supabase.auth.signOut()
    clearActiveSession()
    
    // Set new active session
    setActiveSession(session)
    
    // Update last login time
    const sessions = getStoredSessions()
    const updatedSessions = sessions.map(s => 
      s.id === session.id 
        ? { ...s, last_login: new Date().toISOString() }
        : s
    )
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSessions))
    
    return session
  } catch (error) {
    console.error('Failed to switch session:', error)
    throw error
  }
}

/**
 * Format session display name
 * @param {Object} session - Session object
 * @returns {string} Formatted display name
 */
export function formatSessionName(session) {
  if (session.name && session.name !== session.email) {
    return `${session.name} (${session.email})`
  }
  return session.email
}

/**
 * Format last login time
 * @param {string} lastLogin - ISO date string
 * @returns {string} Formatted time string
 */
export function formatLastLogin(lastLogin) {
  try {
    const date = new Date(lastLogin)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  } catch (error) {
    return 'Unknown'
  }
}
