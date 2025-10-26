#!/usr/bin/env node

/**
 * Notification Cleanup Script
 * 
 * Purpose: Clean up expired notifications older than 7 days
 * 
 * Usage:
 *   node scripts/cleanup-notifications.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --verbose    Show detailed output
 * 
 * Examples:
 *   node scripts/cleanup-notifications.js --dry-run
 *   node scripts/cleanup-notifications.js --verbose
 *   node scripts/cleanup-notifications.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from project root
const envPath = join(__dirname, '..', '.env')
config({ path: envPath })

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isVerbose = args.includes('--verbose')

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌')
  console.error('')
  console.error('Please check your .env file and ensure all required variables are set.')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Get statistics about notifications
 */
async function getNotificationStats() {
  try {
    // Get total notifications
    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })

    // Get notifications within retention period
    const { count: activeCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString())

    // Get expired notifications
    const { count: expiredCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .lte('expires_at', new Date().toISOString())

    // Get notifications by status
    const { data: statusStats } = await supabase
      .from('notifications')
      .select('status')
      .lte('expires_at', new Date().toISOString())

    const statusCounts = statusStats?.reduce((acc, notif) => {
      acc[notif.status] = (acc[notif.status] || 0) + 1
      return acc
    }, {}) || {}

    return {
      total: totalCount || 0,
      active: activeCount || 0,
      expired: expiredCount || 0,
      statusCounts
    }
  } catch (error) {
    console.error('Error getting notification stats:', error)
    return null
  }
}

/**
 * Clean up expired notifications
 */
async function cleanupExpiredNotifications() {
  try {
    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No notifications will be deleted')
    }

    // Get stats before cleanup
    const statsBefore = await getNotificationStats()
    if (!statsBefore) {
      throw new Error('Failed to get notification statistics')
    }

    console.log('📊 Notification Statistics:')
    console.log(`   Total notifications: ${statsBefore.total}`)
    console.log(`   Active (within 7 days): ${statsBefore.active}`)
    console.log(`   Expired (older than 7 days): ${statsBefore.expired}`)
    
    if (isVerbose && Object.keys(statsBefore.statusCounts).length > 0) {
      console.log('   Expired by status:')
      Object.entries(statsBefore.statusCounts).forEach(([status, count]) => {
        console.log(`     ${status}: ${count}`)
      })
    }

    if (statsBefore.expired === 0) {
      console.log('✅ No expired notifications to clean up')
      return { deleted: 0 }
    }

    if (isDryRun) {
      console.log(`🔍 Would delete ${statsBefore.expired} expired notifications`)
      return { deleted: statsBefore.expired }
    }

    // Perform cleanup using database function
    const { data: deletedCount, error } = await supabase.rpc('cleanup_expired_notifications')

    if (error) {
      throw error
    }

    const deleted = deletedCount || 0
    console.log(`✅ Successfully deleted ${deleted} expired notifications`)

    // Get stats after cleanup
    const statsAfter = await getNotificationStats()
    if (statsAfter) {
      console.log('📊 After cleanup:')
      console.log(`   Total notifications: ${statsAfter.total}`)
      console.log(`   Active (within 7 days): ${statsAfter.active}`)
      console.log(`   Expired (older than 7 days): ${statsAfter.expired}`)
    }

    return { deleted }
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

/**
 * Show detailed information about expired notifications
 */
async function showExpiredDetails() {
  if (!isVerbose) return

  try {
    const { data: expiredNotifications, error } = await supabase
      .from('notifications')
      .select('id, type, status, created_at, expires_at, message')
      .lte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    if (expiredNotifications && expiredNotifications.length > 0) {
      console.log('\n📋 Sample expired notifications:')
      expiredNotifications.forEach((notif, index) => {
        const createdDate = new Date(notif.created_at).toLocaleDateString()
        const expiredDate = new Date(notif.expires_at).toLocaleDateString()
        console.log(`   ${index + 1}. ${notif.type} (${notif.status}) - Created: ${createdDate}, Expired: ${expiredDate}`)
        if (notif.message) {
          console.log(`      Message: ${notif.message.substring(0, 50)}...`)
        }
      })
      
      if (expiredNotifications.length === 10) {
        console.log('   ... (showing first 10)')
      }
    }
  } catch (error) {
    console.warn('Warning: Could not fetch expired notification details:', error.message)
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🧹 StyleSnap Notification Cleanup Script')
  console.log('==========================================')
  
  if (isDryRun) {
    console.log('🔍 Running in DRY RUN mode')
  }
  
  console.log(`📅 Current time: ${new Date().toLocaleString()}`)
  console.log('')

  try {
    // Show expired notification details if verbose
    await showExpiredDetails()

    // Perform cleanup
    const result = await cleanupExpiredNotifications()

    console.log('')
    console.log('✅ Cleanup completed successfully!')
    
    if (isDryRun) {
      console.log('💡 To actually delete notifications, run without --dry-run flag')
    } else {
      console.log(`🗑️  Deleted ${result.deleted} expired notifications`)
    }

  } catch (error) {
    console.error('')
    console.error('❌ Cleanup failed:', error.message)
    process.exit(1)
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n⚠️  Script interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Script terminated')
  process.exit(0)
})

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
