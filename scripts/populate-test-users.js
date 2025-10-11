/**
 * Populate Test Users for Friends Feature Testing
 * 
 * This script creates multiple test users with different names and emails
 * so you can test the find friends feature properly.
 * 
 * Features:
 * - Creates 5+ test users with realistic names
 * - Uses unique emails to avoid conflicts
 * - Includes users with different name patterns for search testing
 * - Creates some friendships between users for testing
 * 
 * Usage:
 *   node scripts/populate-test-users.js
 * 
 * Requirements:
 * - Supabase project set up
 * - Environment variables configured (.env file)
 * - Database migrations applied
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Initialize Supabase client with service role key for admin operations
// Note: Service role key bypasses RLS policies
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// Test admin user ID (created by the SQL migration)
const TEST_ADMIN_ID = '00000000-0000-0000-0000-000000000001'

// Test users with diverse names for search testing
const testUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@test.com',
    username: 'alice_johnson'
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@test.com', 
    username: 'bob_smith'
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@test.com',
    username: 'carol_davis'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@test.com',
    username: 'david_wilson'
  },
  {
    name: 'Emma Brown',
    email: 'emma.brown@test.com',
    username: 'emma_brown'
  },
  {
    name: 'Frank Miller',
    email: 'frank.miller@test.com',
    username: 'frank_miller'
  },
  {
    name: 'Grace Lee',
    email: 'grace.lee@test.com',
    username: 'grace_lee'
  },
  {
    name: 'Henry Taylor',
    email: 'henry.taylor@test.com',
    username: 'henry_taylor'
  },
  {
    name: 'Ivy Chen',
    email: 'ivy.chen@test.com',
    username: 'ivy_chen'
  },
  {
    name: 'Jack Anderson',
    email: 'jack.anderson@test.com',
    username: 'jack_anderson'
  }
]

/**
 * Verify test admin user exists
 */
async function verifyTestAdmin() {
  console.log('🔍 Verifying test admin user exists...')
  
  try {
    const { data: adminUser, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', TEST_ADMIN_ID)
      .single()
    
    if (error) {
      console.error('❌ Test admin user not found!')
      console.error('Please run the updated SQL migration first:')
      console.error('1. Go to Supabase Dashboard → SQL Editor')
      console.error('2. Copy and run the updated sql/002_rls_policies.sql file')
      console.error('3. Then run this script again')
      return false
    }
    
    console.log(`✅ Test admin user found: ${adminUser.name} (${adminUser.email})`)
    return true
    
  } catch (error) {
    console.error('❌ Error verifying test admin:', error.message)
    return false
  }
}

/**
 * Create test users in the database
 */
async function createTestUsers() {
  console.log('🚀 Creating test users for friends feature testing...')
  console.log(`👥 Creating ${testUsers.length} test users...`)
  
  const createdUsers = []
  
  try {
    for (const userData of testUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single()
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.name} already exists, skipping...`)
        createdUsers.push(existingUser)
        continue
      }
      
      // Create new user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          username: userData.username,
          avatar_url: null, // Will use default avatar
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error(`❌ Error creating user ${userData.name}:`, error.message)
        continue
      }
      
      console.log(`✅ Created user: ${userData.name} (${userData.email})`)
      createdUsers.push(user)
    }
    
    console.log(`\n🎉 Successfully created/verified ${createdUsers.length} test users!`)
    return createdUsers
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message)
    throw error
  }
}

/**
 * Create some test friendships between users
 */
async function createTestFriendships(users) {
  console.log('\n🤝 Creating test friendships...')
  
  try {
    // Create a few friendships for testing
    const friendships = [
      { from: 0, to: 1 }, // Alice -> Bob
      { from: 1, to: 2 }, // Bob -> Carol
      { from: 2, to: 3 }, // Carol -> David
      { from: 4, to: 5 }, // Emma -> Frank
      { from: 6, to: 7 }, // Grace -> Henry
    ]
    
    let createdCount = 0
    
    for (const friendship of friendships) {
      if (friendship.from >= users.length || friendship.to >= users.length) {
        continue
      }
      
      const user1 = users[friendship.from]
      const user2 = users[friendship.to]
      
      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friends')
        .select('id')
        .or(`and(requester_id.eq.${user1.id},receiver_id.eq.${user2.id}),and(requester_id.eq.${user2.id},receiver_id.eq.${user1.id})`)
        .single()
      
      if (existingFriendship) {
        console.log(`⚠️  Friendship between ${user1.name} and ${user2.name} already exists`)
        continue
      }
      
      // Create friendship (using canonical ordering: smaller ID as requester)
      const requesterId = user1.id < user2.id ? user1.id : user2.id
      const receiverId = user1.id < user2.id ? user2.id : user1.id
      
      const { error } = await supabase
        .from('friends')
        .insert({
          requester_id: requesterId,
          receiver_id: receiverId,
          status: 'accepted',
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`❌ Error creating friendship between ${user1.name} and ${user2.name}:`, error.message)
        continue
      }
      
      console.log(`✅ Created friendship: ${user1.name} ↔ ${user2.name}`)
      createdCount++
    }
    
    console.log(`\n🎉 Created ${createdCount} test friendships!`)
    
  } catch (error) {
    console.error('❌ Error creating friendships:', error.message)
  }
}

/**
 * Display testing instructions
 */
function displayTestingInstructions(users) {
  console.log('\n📋 Testing Instructions:')
  console.log('========================================')
  console.log('\n1. 🔍 Test Search Functionality:')
  console.log('   - Go to /friends page')
  console.log('   - Click "Find Friends" tab')
  console.log('   - Try searching for:')
  
  // Show some search examples
  const searchExamples = [
    'alice', 'bob', 'carol', 'david', 'emma',
    'johnson', 'smith', 'davis', 'wilson',
    'alice.johnson@test.com', 'bob.smith@test.com'
  ]
  
  searchExamples.forEach(example => {
    console.log(`     • "${example}"`)
  })
  
  console.log('\n2. 👥 Test Friend Requests:')
  console.log('   - Search for users you haven\'t added yet')
  console.log('   - Click "Add Friend" button')
  console.log('   - Verify request status changes')
  
  console.log('\n3. ✅ Test Existing Friendships:')
  console.log('   - Search for users who are already friends')
  console.log('   - Verify "Already Friends" status shows')
  
  console.log('\n4. 📱 Test Different Scenarios:')
  console.log('   - Search with < 3 characters (should show hint)')
  console.log('   - Search for non-existent users')
  console.log('   - Test with special characters')
  
  console.log('\n📊 Test Users Created:')
  users.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.name} (${user.email})`)
  })
  
  console.log('\n💡 Pro Tips:')
  console.log('   - Use different browser windows/incognito tabs to test with different accounts')
  console.log('   - Check browser console for any JavaScript errors')
  console.log('   - Test the complete flow: search → send request → accept/reject')
  
  console.log('\n🧹 Cleanup:')
  console.log('   - To remove test users, run: node scripts/cleanup-test-users.js')
  console.log('   - Or manually delete from Supabase dashboard')
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL) {
      console.error('❌ Missing VITE_SUPABASE_URL environment variable!')
      console.error('Please ensure .env file contains:')
      console.error('  VITE_SUPABASE_URL=your-supabase-url')
      process.exit(1)
    }
    
    if (!process.env.SUPABASE_SERVICE_KEY && !process.env.VITE_SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase key!')
      console.error('Please ensure .env file contains either:')
      console.error('  SUPABASE_SERVICE_KEY=your-service-key (recommended for admin operations)')
      console.error('  OR')
      console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key (fallback)')
      console.error('')
      console.error('Note: Service role key bypasses RLS policies and is required for creating users.')
      process.exit(1)
    }
    
    // Verify test admin user exists
    const adminExists = await verifyTestAdmin()
    if (!adminExists) {
      process.exit(1)
    }
    
    // Create test users
    const users = await createTestUsers()
    
    if (users.length === 0) {
      console.log('❌ No users were created. Check your database connection.')
      process.exit(1)
    }
    
    // Create some test friendships
    await createTestFriendships(users)
    
    // Display testing instructions
    displayTestingInstructions(users)
    
    console.log('\n🎉 Test data population complete!')
    console.log('You can now test the find friends feature with realistic data.')
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
