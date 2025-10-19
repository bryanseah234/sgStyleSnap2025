/**
 * Cleanup Test Users Script
 * 
 * This script removes all test users created by populate-test-users.js
 * to clean up your database after testing.
 * 
 * Usage:
 *   node scripts/cleanup-test-users.js
 * 
 * Safety Features:
 * - Only deletes users with test emails (@test.com domain)
 * - Confirmation prompt before deletion
 * - Detailed logging of what's being deleted
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import readline from 'readline'

// Initialize Supabase client with service role key for admin operations
// Note: Service role key bypasses RLS policies
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
}

/**
 * Ask for user confirmation
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = createReadlineInterface()
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase().trim())
    })
  })
}

/**
 * Find all test users
 */
async function findTestUsers() {
  console.log('🔍 Finding test users...')
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, username, created_at')
      .like('email', '%@test.com')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return users || []
    
  } catch (error) {
    console.error('❌ Error finding test users:', error.message)
    throw error
  }
}

/**
 * Delete test users and related data
 */
async function deleteTestUsers(users) {
  console.log(`\n🗑️  Deleting ${users.length} test users and related data...`)
  
  try {
    const userIds = users.map(user => user.id)
    
    // Delete in order of dependencies
    
    // 1. Delete likes
    console.log('   Deleting likes...')
    const { error: likesError } = await supabase
      .from('likes')
      .delete()
      .in('user_id', userIds)
    
    if (likesError) console.warn('   ⚠️  Warning deleting likes:', likesError.message)
    
    // 2. Delete notifications
    console.log('   Deleting notifications...')
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .in('user_id', userIds)
    
    if (notificationsError) console.warn('   ⚠️  Warning deleting notifications:', notificationsError.message)
    
    // 3. Delete suggestions
    console.log('   Deleting outfit suggestions...')
    const { error: suggestionsError } = await supabase
      .from('friend_outfit_suggestions')
      .delete()
      .or(`from_user_id.in.(${userIds.join(',')}),to_user_id.in.(${userIds.join(',')})`)
    
    if (suggestionsError) console.warn('   ⚠️  Warning deleting suggestions:', suggestionsError.message)
    
    // 4. Delete friendships
    console.log('   Deleting friendships...')
    const { error: friendshipsError } = await supabase
      .from('friends')
      .delete()
      .or(`requester_id.in.(${userIds.join(',')}),receiver_id.in.(${userIds.join(',')})`)
    
    if (friendshipsError) console.warn('   ⚠️  Warning deleting friendships:', friendshipsError.message)
    
    // 5. Delete collections
    console.log('   Deleting collections...')
    const { error: collectionsError } = await supabase
      .from('collections')
      .delete()
      .in('user_id', userIds)
    
    if (collectionsError) console.warn('   ⚠️  Warning deleting collections:', collectionsError.message)
    
    // 6. Delete outfits
    console.log('   Deleting outfits...')
    const { error: outfitsError } = await supabase
      .from('outfits')
      .delete()
      .in('user_id', userIds)
    
    if (outfitsError) console.warn('   ⚠️  Warning deleting outfits:', outfitsError.message)
    
    // 7. Delete clothing items
    console.log('   Deleting clothing items...')
    const { error: itemsError } = await supabase
      .from('clothes')
      .delete()
      .in('owner_id', userIds)
    
    if (itemsError) console.warn('   ⚠️  Warning deleting items:', itemsError.message)
    
    // 8. Delete users (last)
    console.log('   Deleting users...')
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .in('id', userIds)
    
    if (usersError) throw usersError
    
    console.log('✅ Successfully deleted all test users and related data!')
    
  } catch (error) {
    console.error('❌ Error deleting test users:', error.message)
    throw error
  }
}

/**
 * Display summary of what will be deleted
 */
function displayDeletionSummary(users) {
  console.log('\n📋 Summary of Test Users to Delete:')
  console.log('=====================================')
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Username: ${user.username}`)
    console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`)
    console.log('')
  })
  
  console.log(`Total: ${users.length} test users`)
  console.log('\n⚠️  This will also delete ALL related data:')
  console.log('   • Clothing items owned by these users')
  console.log('   • Outfits created by these users')
  console.log('   • Collections created by these users')
  console.log('   • Friendships involving these users')
  console.log('   • Outfit suggestions sent/received by these users')
  console.log('   • Notifications for these users')
  console.log('   • Likes given by these users')
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🧹 Test Users Cleanup Script')
    console.log('============================')
    
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
      process.exit(1)
    }
    
    // Find test users
    const testUsers = await findTestUsers()
    
    if (testUsers.length === 0) {
      console.log('✅ No test users found to delete!')
      console.log('   (Looking for users with @test.com email addresses)')
      process.exit(0)
    }
    
    // Display what will be deleted
    displayDeletionSummary(testUsers)
    
    // Ask for confirmation
    const confirm = await askConfirmation('\n❓ Are you sure you want to delete all test users? (yes/no): ')
    
    if (confirm !== 'yes' && confirm !== 'y') {
      console.log('❌ Deletion cancelled.')
      process.exit(0)
    }
    
    // Delete test users
    await deleteTestUsers(testUsers)
    
    console.log('\n🎉 Cleanup complete!')
    console.log('All test users and related data have been removed from your database.')
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
