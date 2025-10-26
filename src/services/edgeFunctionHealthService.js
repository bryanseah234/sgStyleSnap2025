/**
 * StyleSnap - Edge Function Health Service
 * 
 * This service monitors the health and status of the
 * sync-auth-users-realtime Edge Function.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase'

export class EdgeFunctionHealthService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL
    // Construct Edge Function URL from base Supabase URL
    this.functionUrl = this.baseUrl ? `${this.baseUrl}/functions/v1/sync-auth-users-realtime` : null
  }

  /**
   * Check the health of the sync Edge Function
   * @returns {Promise<Object>} Health status and metrics
   */
  async checkHealth() {
    try {
      console.log('🔍 EdgeFunctionHealth: Checking Edge Function health...')
      
      if (!this.functionUrl) {
        throw new Error('Edge Function URL not configured')
      }

      // Make a health check request to the Edge Function
      const response = await fetch(`${this.functionUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getSupabaseToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`Edge Function health check failed: ${response.status} ${response.statusText}`)
      }

      const healthData = await response.json()
      
      console.log('✅ EdgeFunctionHealth: Edge Function is healthy:', healthData)
      
      return {
        success: true,
        healthy: true,
        data: healthData,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ EdgeFunctionHealth: Health check failed:', error)
      
      return {
        success: false,
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get Supabase access token for Edge Function authentication
   * @returns {Promise<string>} Access token
   */
  async getSupabaseToken() {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }

      return session.access_token
    } catch (error) {
      console.warn('⚠️ EdgeFunctionHealth: Could not get Supabase token:', error.message)
      return null
    }
  }

  /**
   * Get Edge Function metrics and status
   * @returns {Promise<Object>} Function metrics
   */
  async getMetrics() {
    try {
      console.log('📊 EdgeFunctionHealth: Getting Edge Function metrics...')
      
      // This would typically call a metrics endpoint if available
      // For now, we'll return basic status information
      const healthStatus = await this.checkHealth()
      
      return {
        success: true,
        metrics: {
          functionUrl: this.functionUrl,
          baseUrl: this.baseUrl,
          lastHealthCheck: healthStatus.timestamp,
          healthy: healthStatus.healthy,
          uptime: 'Unknown', // Would need metrics endpoint for this
          processedEvents: 'Unknown' // Would need metrics endpoint for this
        }
      }
    } catch (error) {
      console.error('❌ EdgeFunctionHealth: Failed to get metrics:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Test user sync by checking if a test user exists
   * @param {string} userId - User ID to check
   * @returns {Promise<Object>} Sync status for the user
   */
  async testUserSync(userId) {
    try {
      console.log('🧪 EdgeFunctionHealth: Testing user sync for:', userId)
      
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      // Check if user exists in public.users
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      console.log('✅ EdgeFunctionHealth: User sync test successful:', user)
      
      return {
        success: true,
        userExists: !!user,
        user: user,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ EdgeFunctionHealth: User sync test failed:', error)
      
      return {
        success: false,
        userExists: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Check if Edge Function is properly configured and deployed
   * @returns {Promise<Object>} Deployment status
   */
  async checkDeploymentStatus() {
    try {
      console.log('🚀 EdgeFunctionHealth: Checking deployment status...')
      
      if (!this.functionUrl) {
        throw new Error('Edge Function URL not configured')
      }

      // Check if the Edge Function endpoint is accessible
      const response = await fetch(`${this.functionUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const isDeployed = response.ok
      
      return {
        success: true,
        deployed: isDeployed,
        status: isDeployed ? 'Active' : 'Inactive',
        url: this.functionUrl,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ EdgeFunctionHealth: Deployment check failed:', error)
      
      return {
        success: false,
        deployed: false,
        status: 'Error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Monitor user sync performance
   * @returns {Promise<Object>} Sync performance metrics
   */
  async getSyncPerformanceMetrics() {
    try {
      console.log('📈 EdgeFunctionHealth: Getting sync performance metrics...')
      
      // This would typically query metrics from a monitoring system
      // For now, we'll return basic information
      const deploymentStatus = await this.checkDeploymentStatus()
      const healthStatus = await this.checkHealth()
      
      return {
        success: true,
        metrics: {
          functionDeployed: deploymentStatus.deployed,
          functionHealthy: healthStatus.healthy,
          lastHealthCheck: healthStatus.timestamp,
          responseTime: 'Unknown', // Would need metrics endpoint
          syncSuccessRate: 'Unknown', // Would need metrics endpoint
          totalSyncs: 'Unknown' // Would need metrics endpoint
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ EdgeFunctionHealth: Failed to get performance metrics:', error)
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get configuration status
   * @returns {Object} Configuration status
   */
  getConfigStatus() {
    return {
      functionUrl: this.functionUrl ? '✅ Configured' : '❌ Not configured',
      baseUrl: this.baseUrl ? '✅ Configured' : '❌ Not configured',
      supabase: supabase ? '✅ Configured' : '❌ Not configured'
    }
  }
}

// Export singleton instance
export const edgeFunctionHealthService = new EdgeFunctionHealthService()
