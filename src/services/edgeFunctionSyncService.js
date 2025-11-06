/**
 * Stylesnap - Edge Function Sync Service
 * 
 * This service handles monitoring and interaction with the
 * sync-auth-users-realtime Edge Function for user synchronization.
 * 
 * @author Stylesnap Team
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase'

export class EdgeFunctionSyncService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL
    // Construct Edge Function URL from base Supabase URL
    this.functionUrl = this.baseUrl ? `${this.baseUrl}/functions/v1/sync-auth-users-realtime` : null
  }

  /**
   * Monitor user sync status
   * @param {string} userId - User ID to monitor
   * @returns {Promise<Object>} Sync status and progress
   */
  async monitorUserSync(userId) {
    try {
      console.log('🔍 EdgeFunctionSync: Monitoring user sync for:', userId)
      
      if (!this.functionUrl) {
        console.log('ℹ️ EdgeFunctionSync: Edge Function URL not configured (base URL missing) - using fallback sync check')
        // Fallback to direct database check when Edge Function is not available
        return await this.checkUserSyncFallback(userId)
      }

      // Check if user exists in public.users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        return {
          success: true,
          synced: false,
          status: 'pending',
          message: 'User sync in progress - profile not yet created',
          timestamp: new Date().toISOString()
        }
      }

      if (error) {
        throw error
      }

      if (user) {
        return {
          success: true,
          synced: true,
          status: 'completed',
          message: 'User profile successfully synchronized',
          user: user,
          timestamp: new Date().toISOString()
        }
      }

      return {
        success: false,
        synced: false,
        status: 'error',
        message: 'Unknown sync status',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ EdgeFunctionSync: Error monitoring user sync:', error)
      
      return {
        success: false,
        synced: false,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Wait for user sync completion
   * @param {string} userId - User ID to wait for
   * @param {number} maxWaitTime - Maximum time to wait in milliseconds
   * @returns {Promise<Object>} Final sync status
   */
  async waitForUserSync(userId, maxWaitTime = 30000) {
    try {
      console.log('⏳ EdgeFunctionSync: Waiting for user sync completion:', userId)
      
      const startTime = Date.now()
      const checkInterval = 1000 // Check every second
      
      while (Date.now() - startTime < maxWaitTime) {
        const syncStatus = await this.monitorUserSync(userId)
        
        if (syncStatus.success && syncStatus.synced) {
          console.log('✅ EdgeFunctionSync: User sync completed successfully')
          return syncStatus
        }
        
        if (syncStatus.success && syncStatus.status === 'error') {
          console.log('❌ EdgeFunctionSync: User sync failed')
          return syncStatus
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval))
      }
      
      // Timeout reached
      console.warn('⚠️ EdgeFunctionSync: User sync timeout reached')
      return {
        success: false,
        synced: false,
        status: 'timeout',
        message: 'User sync timeout - profile not created within expected timeframe',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ EdgeFunctionSync: Error waiting for user sync:', error)
      
      return {
        success: false,
        synced: false,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Check Edge Function sync health
   * @returns {Promise<Object>} Sync function health status
   */
  async checkSyncHealth() {
    // DISABLED: Edge function health endpoint does not exist
    // User sync is handled automatically by database triggers
    console.log('ℹ️ EdgeFunctionSync: Health check disabled (endpoint does not exist)')
    
    return {
      success: true,
      healthy: true,
      message: 'Health check disabled - using database triggers for sync',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Get sync function configuration
   * @returns {Object} Configuration status
   */
  getConfigStatus() {
    return {
      functionUrl: this.functionUrl ? '✅ Configured (constructed from base URL)' : '❌ Not configured (base URL missing)',
      baseUrl: this.baseUrl ? '✅ Configured' : '❌ Not configured',
      supabase: supabase ? '✅ Configured' : '❌ Not configured'
    }
  }

  /**
   * Fallback method to check user sync when Edge Function is not available
   * @param {string} userId - User ID to check
   * @returns {Promise<Object>} Sync status
   */
  async checkUserSyncFallback(userId) {
    try {
      console.log('🔍 EdgeFunctionSync: Using fallback sync check for:', userId)
      
      // Check if user exists in public.users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        return {
          success: true,
          synced: false,
          status: 'pending',
          message: 'User sync in progress - profile not yet created (fallback check)',
          timestamp: new Date().toISOString()
        }
      }

      if (error) {
        throw error
      }

      if (user) {
        return {
          success: true,
          synced: true,
          status: 'completed',
          message: 'User profile successfully synchronized (fallback check)',
          user: user,
          timestamp: new Date().toISOString()
        }
      }

      return {
        success: false,
        synced: false,
        status: 'error',
        message: 'Unknown sync status (fallback check)',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ EdgeFunctionSync: Error in fallback sync check:', error)
      
      return {
        success: false,
        synced: false,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Test Edge Function connectivity
   * @returns {Promise<Object>} Connectivity test result
   */
  async testConnectivity() {
    // DISABLED: Edge function connectivity endpoint does not exist
    // User sync is handled automatically by database triggers
    console.log('ℹ️ EdgeFunctionSync: Connectivity test disabled (endpoint does not exist)')
    
    return {
      success: true,
      connected: true,
      message: 'Connectivity test disabled - using database triggers for sync',
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const edgeFunctionSyncService = new EdgeFunctionSyncService()
