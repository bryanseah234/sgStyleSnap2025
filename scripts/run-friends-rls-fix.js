#!/usr/bin/env node

/**
 * Quick script to run the friends RLS fix migration
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nztqjmknblelnzpeatyx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  console.error('Please set it in your .env file or environment.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🔧 Running friends RLS fix migration...')
    
    // Read the migration file
    const migrationSQL = readFileSync('./database/migrations/041_fix_friends_rls_insert_policy.sql', 'utf8')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('✅ Friends table RLS policy has been fixed')
    
  } catch (error) {
    console.error('❌ Error running migration:', error)
  }
}

runMigration()
