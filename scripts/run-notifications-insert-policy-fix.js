#!/usr/bin/env node

/**
 * Run Notifications INSERT Policy Fix Migration
 * 
 * This script runs the 028_fix_notifications_insert_policy.sql migration
 * which adds the missing INSERT policy for the notifications table
 * 
 * Usage: node scripts/run-notifications-insert-policy-fix.js
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
    console.log('🚀 Starting Notifications INSERT Policy Fix Migration...\n')

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/028_fix_notifications_insert_policy.sql')
    console.log(`📖 Reading migration file: ${migrationPath}`)
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    if (!migrationSQL) {
      throw new Error('Migration file is empty')
    }

    console.log('✅ Migration file loaded successfully\n')
    console.log('📝 Migration includes:')
    console.log('   - Adds missing INSERT policy for notifications table')
    console.log('   - Allows system triggers to insert notifications')
    console.log('   - Grants necessary permissions\n')

    // Execute migration
    console.log('⚙️  Executing migration...')
    
    // Try to execute the migration using the REST API
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: migrationSQL
      })

      if (error) {
        throw error
      }

      console.log('✅ Migration executed successfully!\n')
    } catch (error) {
      console.log('ℹ️  exec_sql not available, trying alternative methods...')
      
      // Try to execute individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))
      
      for (const statement of statements) {
        if (statement.includes('CREATE POLICY')) {
          console.log('📝 Creating policy...')
          // This would need to be executed via psql or Supabase dashboard
          console.log('⚠️  Policy creation requires direct database access')
        }
      }
      
      throw new Error('Direct SQL execution not supported. Please run via psql or Supabase dashboard.')
    }

    console.log('📊 Summary of changes:')
    console.log('   ✓ Added INSERT policy for notifications table')
    console.log('   ✓ Granted INSERT permissions to authenticated role')
    console.log('   ✓ Fixed friend request notification triggers\n')

    console.log('🎉 Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Test friend request functionality')
    console.log('   2. Verify notifications are created correctly')
    console.log('   3. Check that friend request acceptance works')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    
    if (error.message.includes('Direct SQL execution not supported')) {
      console.log('\n💡 Alternative execution methods:')
      console.log('\n1. Using psql:')
      console.log('   psql -h <your-db-host> -U postgres -d postgres -f database/migrations/028_fix_notifications_insert_policy.sql')
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
console.log('║  Notifications INSERT Policy Fix Migration      ║')
console.log('║  Migration: 028_fix_notifications_insert_policy.sql ║')
console.log('╚════════════════════════════════════════════════╝\n')

runMigration()
