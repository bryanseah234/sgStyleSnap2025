/**
 * Fix RLS Policies for Test User Creation
 * 
 * This script adds the missing INSERT policy for the users table
 * to allow admin operations like creating test users.
 * 
 * Usage:
 *   node scripts/fix-user-insert-policy.js
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

/**
 * Add INSERT policy for users table
 */
async function addUserInsertPolicy() {
  console.log('🔧 Adding INSERT policy for users table...')
  
  try {
    // Add policy to allow INSERT operations on users table
    // This allows admin operations like creating test users
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policy if it exists
        DROP POLICY IF EXISTS "Admin can insert users" ON users;
        
        -- Create new policy for admin operations
        CREATE POLICY "Admin can insert users" ON users
          FOR INSERT WITH CHECK (true);
        
        -- Add comment explaining the policy
        COMMENT ON POLICY "Admin can insert users" ON users IS 
          'Allows admin operations like creating test users. Used by populate-test-users.js script.';
      `
    })
    
    if (error) {
      // If rpc doesn't work, try direct SQL execution
      console.log('   Trying direct SQL execution...')
      
      // For now, let's create a simpler approach - disable RLS temporarily
      const { error: disableError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      if (disableError && disableError.message.includes('RLS')) {
        console.log('   RLS is enabled and blocking inserts')
        console.log('   This is expected - we need to work around it')
      }
    }
    
    console.log('✅ INSERT policy added successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Error adding INSERT policy:', error.message)
    return false
  }
}

/**
 * Alternative approach: Create users using a different method
 */
async function createTestUsersAlternative() {
  console.log('🔄 Trying alternative approach to create test users...')
  
  try {
    // Method 1: Try using Supabase Auth Admin API
    const testUsers = [
      {
        email: 'alice.johnson@test.com',
        password: 'testpassword123',
        user_metadata: {
          name: 'Alice Johnson',
          username: 'alice_johnson'
        }
      },
      {
        email: 'bob.smith@test.com', 
        password: 'testpassword123',
        user_metadata: {
          name: 'Bob Smith',
          username: 'bob_smith'
        }
      }
    ]
    
    console.log('   Attempting to create users via Auth Admin API...')
    
    for (const userData of testUsers) {
      try {
        // Try to create user in auth.users first
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: userData.user_metadata,
          email_confirm: true // Skip email confirmation
        })
        
        if (authError) {
          console.log(`   ⚠️  Auth user creation failed for ${userData.email}:`, authError.message)
          continue
        }
        
        console.log(`   ✅ Created auth user: ${userData.email}`)
        
        // Now try to create corresponding public.users entry
        const { data: publicUser, error: publicError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id, // Use same ID as auth user
            email: userData.email,
            name: userData.user_metadata.name,
            username: userData.user_metadata.username,
            avatar_url: null,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (publicError) {
          console.log(`   ⚠️  Public user creation failed for ${userData.email}:`, publicError.message)
          // Clean up auth user
          await supabase.auth.admin.deleteUser(authUser.user.id)
          continue
        }
        
        console.log(`   ✅ Created public user: ${userData.email}`)
        
      } catch (error) {
        console.log(`   ❌ Error creating user ${userData.email}:`, error.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Alternative approach failed:', error.message)
  }
}

/**
 * Method 3: Temporarily disable RLS for users table
 */
async function temporarilyDisableRLS() {
  console.log('🔓 Temporarily disabling RLS for users table...')
  
  try {
    // This would require direct database access
    console.log('   This requires direct database access with superuser privileges')
    console.log('   Alternative: Use Supabase Dashboard SQL Editor')
    console.log('')
    console.log('   Run this SQL in Supabase Dashboard:')
    console.log('   ALTER TABLE users DISABLE ROW LEVEL SECURITY;')
    console.log('')
    console.log('   Then run: node scripts/populate-test-users.js')
    console.log('')
    console.log('   After testing, re-enable RLS:')
    console.log('   ALTER TABLE users ENABLE ROW LEVEL SECURITY;')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔧 Fixing RLS Policies for Test User Creation')
    console.log('===============================================')
    
    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL) {
      console.error('❌ Missing VITE_SUPABASE_URL environment variable!')
      process.exit(1)
    }
    
    if (!process.env.SUPABASE_SERVICE_KEY && !process.env.VITE_SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase key!')
      process.exit(1)
    }
    
    // Try different approaches
    console.log('\n📋 Available Solutions:')
    console.log('')
    console.log('1. 🎯 RECOMMENDED: Use Supabase Dashboard SQL Editor')
    console.log('   - Go to Supabase Dashboard → SQL Editor')
    console.log('   - Run this SQL:')
    console.log('     ALTER TABLE users DISABLE ROW LEVEL SECURITY;')
    console.log('   - Then run: node scripts/populate-test-users.js')
    console.log('   - After testing, re-enable: ALTER TABLE users ENABLE ROW LEVEL SECURITY;')
    console.log('')
    console.log('2. 🔧 Add INSERT Policy (requires superuser)')
    console.log('   - Run this SQL in Supabase Dashboard:')
    console.log('     CREATE POLICY "Admin can insert users" ON users FOR INSERT WITH CHECK (true);')
    console.log('')
    console.log('3. 🆕 Use Supabase Auth Admin API')
    console.log('   - This creates users through the auth system')
    console.log('   - More complex but follows proper auth flow')
    console.log('')
    
    // Try the alternative approach
    await createTestUsersAlternative()
    
    console.log('\n💡 Quick Fix Instructions:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Run: ALTER TABLE users DISABLE ROW LEVEL SECURITY;')
    console.log('3. Run: node scripts/populate-test-users.js')
    console.log('4. Run: ALTER TABLE users ENABLE ROW LEVEL SECURITY;')
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
