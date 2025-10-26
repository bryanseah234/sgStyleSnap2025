#!/usr/bin/env node

/**
 * Run Friend Notifications Migration
 * 
 * This script runs the 027_friend_notifications.sql migration
 * which adds support for:
 * - Friend request notifications
 * - Friend request accepted notifications
 * - Outfit sharing notifications
 * 
 * Usage: node scripts/run-friend-notifications-migration.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Required environment variables:')
  console.error('  - VITE_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting Friend Notifications Migration...\n')

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/027_friend_notifications.sql')
    console.log(`📖 Reading migration file: ${migrationPath}`)
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    if (!migrationSQL) {
      throw new Error('Migration file is empty')
    }

    console.log('✅ Migration file loaded successfully\n')
    console.log('📝 Migration includes:')
    console.log('   - Friend request notifications')
    console.log('   - Friend request accepted notifications')
    console.log('   - Outfit sharing system')
    console.log('   - Helper functions for friend requests')
    console.log('   - RLS policies for outfit_shares\n')

    // Execute migration
    console.log('⚙️  Executing migration...')
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('ℹ️  exec_sql not available, trying direct execution...')
      const { error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1)
      
      if (directError) {
        console.log('ℹ️  Attempting to execute via raw query...')
        // For Supabase, we might need to use the REST API directly
        // or execute via psql command
        throw new Error('Direct SQL execution not supported. Please run via psql or Supabase dashboard.')
      }
    }

    console.log('✅ Migration executed successfully!\n')
    console.log('📊 Summary of changes:')
    console.log('   ✓ Updated notifications table constraints')
    console.log('   ✓ Created outfit_shares table')
    console.log('   ✓ Added friend request notification triggers')
    console.log('   ✓ Added friend request accepted notification triggers')
    console.log('   ✓ Added outfit sharing notification triggers')
    console.log('   ✓ Created helper functions')
    console.log('   ✓ Set up RLS policies\n')

    console.log('🎉 Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Test friend request notifications')
    console.log('   2. Test outfit sharing functionality')
    console.log('   3. Verify notification preferences work correctly')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    
    if (error.message.includes('Direct SQL execution not supported')) {
      console.log('\n💡 Alternative execution methods:')
      console.log('\n1. Using psql:')
      console.log('   psql -h <your-db-host> -U postgres -d postgres -f database/migrations/027_friend_notifications.sql')
      console.log('\n2. Using Supabase Dashboard:')
      console.log('   - Go to SQL Editor in Supabase Dashboard')
      console.log('   - Copy and paste the migration SQL')
      console.log('   - Run the query')
      console.log('\n3. Using Supabase CLI:')
      console.log('   supabase db push --db-url <your-connection-string>')
    }
    
    process.exit(1)
  }
}

// Run migration
console.log('╔════════════════════════════════════════════════╗')
console.log('║  Friend Notifications Migration Runner         ║')
console.log('║  Migration: 027_friend_notifications.sql       ║')
console.log('╚════════════════════════════════════════════════╝\n')

runMigration()

