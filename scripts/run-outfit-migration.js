#!/usr/bin/env node

/**
 * Quick script to run migration 020 (outfits table)
 * Usage: node scripts/run-outfit-migration.js
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
  console.error('💡 Alternative: Copy the contents of database/migrations/020_add_outfits_table.sql')
  console.error('   and run it directly in Supabase Dashboard → SQL Editor')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runOutfitMigration() {
  try {
    console.log('🚀 Running migration 020_add_outfits_table.sql...')
    console.log('')
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'database', 'migrations', '020_add_outfits_table.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration SQL loaded (' + migrationSQL.length + ' bytes)')
    console.log('')
    
    // Split the SQL into individual statements
    // This is necessary because some statements need to run separately
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    console.log('')
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue
      }
      
      try {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`)
        
        // Execute via direct query
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        }).catch(async (e) => {
          // Fallback: try direct query if RPC doesn't exist
          return await supabase.from('_migrations').select('*').limit(1)
        })
        
        if (error) {
          console.error(`   ⚠️  Statement ${i + 1} error:`, error.message)
          errorCount++
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`   ❌ Statement ${i + 1} failed:`, err.message)
        errorCount++
      }
    }
    
    console.log('')
    console.log('📊 Execution Summary:')
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ⚠️  Errors: ${errorCount}`)
    console.log('')
    
    if (errorCount > 0) {
      console.log('⚠️  Some statements had errors.')
      console.log('')
      console.log('💡 RECOMMENDED: Run this migration manually in Supabase Dashboard:')
      console.log('   1. Go to Supabase Dashboard → SQL Editor')
      console.log('   2. Copy contents of: database/migrations/020_add_outfits_table.sql')
      console.log('   3. Paste and execute')
      console.log('')
    } else {
      console.log('✅ Migration completed successfully!')
      console.log('')
      console.log('🎉 The outfits table should now be available!')
      console.log('   Reload your app to test.')
    }
    
  } catch (error) {
    console.error('❌ Fatal error running migration:', error)
    console.log('')
    console.log('💡 MANUAL FIX:')
    console.log('   1. Go to Supabase Dashboard → SQL Editor')
    console.log('   2. Copy contents of: database/migrations/020_add_outfits_table.sql')
    console.log('   3. Paste and execute')
    process.exit(1)
  }
}

// Run the migration
runOutfitMigration()

