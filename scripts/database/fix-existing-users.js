/**
 * Fix Existing Users Script
 * 
 * This script creates public.users entries for users who are already authenticated
 * in auth.users but missing from public.users table.
 * 
 * This fixes the issue where users can log in but don't exist in the database.
 * 
 * Usage:
 *   node scripts/fix-existing-users.js
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

/**
 * Get all auth users who don't have corresponding public.users entries
 */
async function getMissingUsers() {
  console.log('🔍 Finding users who are authenticated but missing from public.users...')
  
  try {
    // Query to find auth users without corresponding public users
    const { data: missingUsers, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          au.id,
          au.email,
          au.raw_user_meta_data,
          au.created_at
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
        ORDER BY au.created_at DESC;
      `
    })
    
    if (error) {
      // If rpc doesn't work, try alternative approach
      console.log('   Trying alternative approach...')
      
      // Get all auth users (this requires service role key)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) throw authError
      
      // Get all public users
      const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('id')
      
      if (publicError) throw publicError
      
      const publicUserIds = new Set(publicUsers.map(u => u.id))
      
      // Find missing users
      const missingUsers = authUsers.users.filter(authUser => 
        !publicUserIds.has(authUser.id)
      )
      
      return missingUsers
    }
    
    return missingUsers || []
    
  } catch (error) {
    console.error('❌ Error finding missing users:', error.message)
    return []
  }
}

/**
 * Create public.users entry for a missing user
 */
async function createPublicUser(authUser) {
  try {
    const userMetadata = authUser.user_metadata || authUser.raw_user_meta_data || {}
    
    // Extract username from email (part before @)
    const emailPrefix = authUser.email.split('@')[0]
    
    // Extract name from metadata or use email prefix
    const name = userMetadata.name || 
                 userMetadata.full_name || 
                 emailPrefix
    
    // Extract avatar URL from metadata
    const avatarUrl = userMetadata.avatar_url || 
                     userMetadata.picture || 
                     null
    
    // Extract Google ID from metadata
    const googleId = userMetadata.sub || 
                    userMetadata.provider_id || 
                    null
    
    // Create public user entry
    const { data: publicUser, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        username: emailPrefix,
        name: name,
        avatar_url: avatarUrl,
        google_id: googleId,
        created_at: authUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error(`   ❌ Error creating user ${authUser.email}:`, error.message)
      return false
    }
    
    console.log(`   ✅ Created user: ${name} (${authUser.email})`)
    return true
    
  } catch (error) {
    console.error(`   ❌ Error processing user ${authUser.email}:`, error.message)
    return false
  }
}

/**
 * Fix all missing users
 */
async function fixMissingUsers() {
  console.log('🔧 Fixing missing users...')
  
  try {
    const missingUsers = await getMissingUsers()
    
    if (missingUsers.length === 0) {
      console.log('✅ No missing users found! All authenticated users have public.users entries.')
      return
    }
    
    console.log(`📋 Found ${missingUsers.length} missing users:`)
    missingUsers.forEach((user, index) => {
      const name = user.user_metadata?.name || user.raw_user_meta_data?.name || user.email
      console.log(`   ${index + 1}. ${name} (${user.email})`)
    })
    
    console.log('\n🔧 Creating missing public.users entries...')
    
    let successCount = 0
    let errorCount = 0
    
    for (const authUser of missingUsers) {
      const success = await createPublicUser(authUser)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
    }
    
    console.log(`\n📊 Results:`)
    console.log(`   ✅ Successfully created: ${successCount} users`)
    console.log(`   ❌ Errors: ${errorCount} users`)
    
    if (successCount > 0) {
      console.log('\n🎉 Missing users have been fixed!')
      console.log('Users can now access the app properly.')
    }
    
  } catch (error) {
    console.error('❌ Error fixing missing users:', error.message)
  }
}

/**
 * Display instructions for manual fix
 */
function displayManualFixInstructions() {
  console.log('\n💡 Manual Fix Instructions (if script fails):')
  console.log('===============================================')
  console.log('')
  console.log('1. Go to Supabase Dashboard → SQL Editor')
  console.log('2. Run this SQL to find missing users:')
  console.log('')
  console.log('   SELECT au.id, au.email, au.raw_user_meta_data')
  console.log('   FROM auth.users au')
  console.log('   LEFT JOIN public.users pu ON au.id = pu.id')
  console.log('   WHERE pu.id IS NULL;')
  console.log('')
  console.log('3. For each missing user, run:')
  console.log('')
  console.log('   INSERT INTO public.users (id, email, username, name, avatar_url, google_id, created_at, updated_at)')
  console.log('   VALUES (')
  console.log('     \'USER_ID_HERE\',')
  console.log('     \'USER_EMAIL_HERE\',')
  console.log('     \'USERNAME_HERE\',')
  console.log('     \'USER_NAME_HERE\',')
  console.log('     NULL, -- avatar_url')
  console.log('     NULL, -- google_id')
  console.log('     NOW(),')
  console.log('     NOW()')
  console.log('   );')
  console.log('')
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔧 Fix Existing Users Script')
    console.log('============================')
    
    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL) {
      console.error('❌ Missing VITE_SUPABASE_URL environment variable!')
      process.exit(1)
    }
    
    if (!process.env.SUPABASE_SERVICE_KEY && !process.env.VITE_SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase key!')
      console.error('Please ensure .env file contains either:')
      console.error('  SUPABASE_SERVICE_KEY=your-service-key (recommended)')
      console.error('  OR')
      console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key (fallback)')
      process.exit(1)
    }
    
    // Fix missing users
    await fixMissingUsers()
    
    // Display manual instructions as backup
    displayManualFixInstructions()
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
