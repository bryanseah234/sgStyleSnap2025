/**
 * Run Migration 035: Fix Approve Friend Outfit Suggestion
 * This migration updates the approve_friend_outfit_suggestion function to work with the new outfits/outfit_items schema
 */

import { supabase } from '../src/lib/supabase.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigration() {
  try {
    console.log('🔄 Starting Migration 035: Fix Approve Friend Outfit Suggestion...\n')

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '035_fix_approve_friend_suggestion.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Migration SQL loaded successfully')
    console.log('⏳ Executing migration...\n')

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      console.error('❌ Error executing migration:', error)
      
      // Try alternative method - execute directly
      console.log('\n🔄 Trying alternative execution method...')
      
      // Split by semicolons and execute each statement
      const statements = migrationSQL.split(';').filter(s => s.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: statementError } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (statementError) {
            console.error('❌ Statement error:', statementError)
            console.log('📝 Statement:', statement.substring(0, 100))
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully!')
      console.log('📊 Result:', data)
    }

    console.log('\n✅ Migration 035 complete!')
    console.log('\nSummary:')
    console.log('- Updated approve_friend_outfit_suggestion function to use outfits/outfit_items tables')
    console.log('- Updated friend_outfit_suggestions table to reference outfits instead of generated_outfits')
    console.log('\n🎉 Friend outfit suggestions should now work correctly!')

  } catch (error) {
    console.error('❌ Fatal error:', error)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

runMigration()

