#!/usr/bin/env node

/**
 * StyleSnap - Database Migration Runner
 * 
 * This script runs all database migrations in the correct order
 * to set up the database schema for StyleSnap.
 * 
 * Usage: node scripts/run-migrations.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   VITE_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Please set these in your .env file or environment.')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// List of migration files in order (as per database/migrations/README.md)
// Note: 000_reset_database.sql is optional and should be run manually if needed
const migrations = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
  '003_indexes_functions.sql',
  '004_advanced_features.sql',
  '005_catalog_system.sql',
  '006_color_detection.sql',
  '007_outfit_generation.sql',
  '008_likes_feature.sql',
  '009_notifications_system.sql',
  '010_push_notifications.sql',
  '011_catalog_enhancements.sql',
  '012_auth_user_sync.sql',
  '013_clothing_types_categories.sql',  // Consolidated from 009_clothing_types + 009_enhanced_categories
  '014_fix_catalog_insert_policy.sql',
  '015_dev_user_setup.sql',
  '016_disable_auto_contribution.sql',
  '017_fix_catalog_privacy.sql',
  '018_notification_cleanup_system.sql',
  '019_fix_notification_function_types.sql',
  '020_add_outfits_table.sql',
  '021_seed_data.sql',
  '022_disable_auto_contribution.sql',
  '023_friends_fixes.sql',  // Consolidated from multiple friends-related fixes
  '024_google_profile_sync.sql',
  '025_user_sync_updates.sql',  // Consolidated from multiple user sync fixes
  '026_email_notifications.sql',  // Consolidated from multiple email notification files
  '027_catalog_updates.sql',  // Consolidated from multiple catalog fix files
  '028_notification_fixes.sql',  // Consolidated from multiple notification fix files
  '029_friend_notifications.sql',  // Renamed from 027_friend_notifications.sql
  '030_slippers_category.sql',  // Consolidated from multiple slippers files
  '031_add_ai_description.sql',  // Renamed from 051_add_ai_description.sql
  '032_email_notification_fixes.sql',  // Consolidated from email disable files
  '033_add_outfit_privacy.sql',  // Renamed from 030_add_outfit_privacy.sql
  '048_improve_username_generation.sql'
]

async function runMigration(filename) {
  try {
    console.log(`🔄 Running migration: ${filename}`)
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'database', 'migrations', filename)
    
    // Check if file exists before reading
    let migrationSQL
    try {
      migrationSQL = readFileSync(migrationPath, 'utf8')
    } catch (readError) {
      if (readError.code === 'ENOENT') {
        console.error(`❌ Migration file not found: ${filename}`)
        console.error(`   Expected path: ${migrationPath}`)
      } else {
        console.error(`❌ Error reading migration ${filename}:`, readError.message)
      }
      return false
    }
    
    if (!migrationSQL || migrationSQL.trim().length === 0) {
      console.error(`❌ Migration ${filename} is empty`)
      return false
    }
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error(`❌ Migration ${filename} failed:`, error.message || error)
      // Don't fail completely - some migrations may already be applied
      // If exec_sql doesn't exist, suggest manual execution
      if (error.message && (error.message.includes('exec_sql') || error.message.includes('function'))) {
        console.error(`   💡 Tip: exec_sql function may not exist. Try running manually via Supabase Dashboard → SQL Editor`)
      }
      return false
    }
    
    console.log(`✅ Migration ${filename} completed successfully`)
    return true
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error.message || error)
    return false
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting database migrations...')
  console.log(`📋 Total migrations to run: ${migrations.length}`)
  console.log('')
  
  // Verify all migration files exist before starting
  console.log('🔍 Verifying migration files exist...')
  const missingFiles = []
  for (const migration of migrations) {
    const migrationPath = join(__dirname, '..', 'database', 'migrations', migration)
    try {
      readFileSync(migrationPath, 'utf8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        missingFiles.push(migration)
      }
    }
  }
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing migration files:')
    missingFiles.forEach(file => console.error(`   - ${file}`))
    console.error('')
    console.error('Please ensure all migration files exist before running.')
    process.exit(1)
  }
  
  console.log(`✅ All ${migrations.length} migration files found`)
  console.log('')
  
  let successCount = 0
  let failureCount = 0
  
  for (const migration of migrations) {
    const success = await runMigration(migration)
    if (success) {
      successCount++
    } else {
      failureCount++
    }
    console.log('') // Add spacing between migrations
  }
  
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${failureCount}`)
  console.log(`   📁 Total: ${migrations.length}`)
  
  if (failureCount > 0) {
    console.log('')
    console.error('❌ Some migrations failed. Please check the errors above.')
    console.error('')
    console.error('💡 Troubleshooting tips:')
    console.error('   1. Check Supabase Dashboard → Logs for detailed error messages')
    console.error('   2. Some migrations may already be applied (safe to re-run)')
    console.error('   3. Ensure you have service_role permissions')
    console.error('   4. Verify database connection and credentials')
    process.exit(1)
  } else {
    console.log('')
    console.log('🎉 All migrations completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Make sure your Supabase project has Google OAuth configured')
    console.log('2. Set up your environment variables in .env')
    console.log('3. Start your development server')
  }
}

// Run the migrations
runAllMigrations().catch(error => {
  console.error('❌ Fatal error running migrations:', error)
  process.exit(1)
})
