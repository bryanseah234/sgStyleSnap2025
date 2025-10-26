#!/usr/bin/env node

/**
 * StyleSnap - Google Profile Sync Migration Runner
 * 
 * This script runs only the Google profile sync migration
 * to fix the OAuth callback error.
 * 
 * Usage: node scripts/run-google-sync-migration.js
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
  console.error('')
  console.error('Alternatively, you can run this migration manually in the Supabase Dashboard:')
  console.error('1. Go to https://supabase.com/dashboard')
  console.error('2. Select your project')
  console.error('3. Go to SQL Editor')
  console.error('4. Copy and paste the contents of database/migrations/024_google_profile_sync.sql')
  console.error('5. Click Run')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runGoogleSyncMigration() {
  try {
    console.log('🚀 Running Google Profile Sync Migration...')
    console.log('')
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'database', 'migrations', '024_google_profile_sync.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded successfully')
    console.log('🔄 Executing migration...')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      console.error('')
      console.error('This might be because:')
      console.error('1. The migration was already run')
      console.error('2. There are permission issues')
      console.error('3. The exec_sql function doesn\'t exist')
      console.error('')
      console.error('Try running the migration manually in the Supabase Dashboard:')
      console.error('1. Go to https://supabase.com/dashboard')
      console.error('2. Select your project')
      console.error('3. Go to SQL Editor')
      console.error('4. Copy and paste the contents of database/migrations/024_google_profile_sync.sql')
      console.error('5. Click Run')
      return false
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('')
    console.log('🎉 Google Profile Sync is now set up!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Try logging in with Google again')
    console.log('2. The OAuth callback should now work properly')
    console.log('3. Your profile will be automatically synced with Google data')
    
    return true
  } catch (error) {
    console.error('❌ Error running migration:', error)
    console.error('')
    console.error('Try running the migration manually in the Supabase Dashboard:')
    console.error('1. Go to https://supabase.com/dashboard')
    console.error('2. Select your project')
    console.error('3. Go to SQL Editor')
    console.error('4. Copy and paste the contents of database/migrations/024_google_profile_sync.sql')
    console.error('5. Click Run')
    return false
  }
}

// Run the migration
runGoogleSyncMigration().catch(error => {
  console.error('❌ Fatal error running migration:', error)
  process.exit(1)
})
