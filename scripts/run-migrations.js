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

// List of migration files in order
const migrations = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
  '003_indexes_functions.sql',
  '004_advanced_features.sql',
  '005_catalog_system.sql',
  '006_color_detection.sql',
  '007_outfit_generation.sql',
  '008_likes_feature.sql',
  '009_clothing_types.sql',
  '009_enhanced_categories.sql',
  '009_notifications_system.sql',
  '010_push_notifications.sql',
  '011_catalog_enhancements.sql',
  '012_auth_user_sync.sql',
  '014_fix_catalog_insert_policy.sql',
  '015_dev_user_setup.sql',
  '016_disable_auto_contribution.sql',
  '017_fix_catalog_privacy.sql',
  '018_notification_cleanup_system.sql',
  '019_fix_notification_function_types.sql',
  '020_add_outfits_table.sql',
  '021_seed_data.sql',
  '022_disable_auto_contribution.sql',
  '023_clear_catalog_data.sql'
]

async function runMigration(filename) {
  try {
    console.log(`🔄 Running migration: ${filename}`)
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'database', 'migrations', filename)
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error(`❌ Migration ${filename} failed:`, error)
      return false
    }
    
    console.log(`✅ Migration ${filename} completed successfully`)
    return true
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error)
    return false
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting database migrations...')
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
