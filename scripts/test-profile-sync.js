#!/usr/bin/env node

/**
 * StyleSnap - Profile Sync Test Script
 * 
 * This script tests the Google profile synchronization functionality
 * to ensure the database functions work correctly.
 * 
 * Usage: node scripts/test-profile-sync.js
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

async function testProfileSyncFunctions() {
  console.log('🧪 Testing Google Profile Sync Functions...')
  console.log('')

  try {
    // Test 1: Check if functions exist
    console.log('1️⃣ Checking if sync functions exist...')
    
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname')
      .in('proname', [
        'get_current_google_profile_data',
        'get_current_google_profile_photo',
        'update_user_google_profile', 
        'sync_user_profile_photo',
        'sync_all_user_profiles'
      ])

    if (functionsError) {
      console.error('❌ Error checking functions:', functionsError)
      return
    }

    console.log('✅ Found functions:', functions.map(f => f.proname))
    console.log('')

    // Test 2: Check if there are any users to test with
    console.log('2️⃣ Checking for existing users...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, avatar_url')
      .limit(5)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    if (users.length === 0) {
      console.log('⚠️  No users found. Please create a user first.')
      return
    }

    console.log(`✅ Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - Avatar: ${user.avatar_url || 'None'}`)
    })
    console.log('')

    // Test 3: Test sync function with first user
    if (users.length > 0) {
      const testUser = users[0]
      console.log(`3️⃣ Testing sync function with user: ${testUser.email}`)
      
      const { data: syncResult, error: syncError } = await supabase.rpc('sync_user_profile_photo', {
        user_id: testUser.id
      })

      if (syncError) {
        console.error('❌ Error testing sync function:', syncError)
        return
      }

      console.log('✅ Sync function result:', JSON.stringify(syncResult, null, 2))
      console.log('')

      // Test 4: Test getting current Google profile data
      console.log(`4️⃣ Testing get_current_google_profile_data function...`)
      
      const { data: googleData, error: dataError } = await supabase.rpc('get_current_google_profile_data', {
        user_id: testUser.id
      })

      if (dataError) {
        console.error('❌ Error getting Google profile data:', dataError)
        return
      }

      console.log('✅ Current Google profile data:', JSON.stringify(googleData, null, 2))
      console.log('')

      // Test 5: Test getting current Google profile photo (legacy)
      console.log(`5️⃣ Testing get_current_google_profile_photo function...`)
      
      const { data: googlePhoto, error: photoError } = await supabase.rpc('get_current_google_profile_photo', {
        user_id: testUser.id
      })

      if (photoError) {
        console.error('❌ Error getting Google profile photo:', photoError)
        return
      }

      console.log('✅ Current Google profile photo:', googlePhoto)
      console.log('')

      // Test 6: Test sync all users function
      console.log('6️⃣ Testing sync_all_user_profiles function...')
      
      const { data: syncAllResult, error: syncAllError } = await supabase.rpc('sync_all_user_profiles')

      if (syncAllError) {
        console.error('❌ Error testing sync all function:', syncAllError)
        return
      }

      console.log('✅ Sync all users result:', JSON.stringify(syncAllResult, null, 2))
      console.log('')
    }

    console.log('🎉 All tests completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run the migration: node scripts/run-migrations.js')
    console.log('2. Test the profile sync in your app')
    console.log('3. Check the profile page for the sync button')

  } catch (error) {
    console.error('❌ Fatal error during testing:', error)
    process.exit(1)
  }
}

// Run the tests
testProfileSyncFunctions().catch(error => {
  console.error('❌ Fatal error running tests:', error)
  process.exit(1)
})
