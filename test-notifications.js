// Test script to create a notification and check if it works
import { supabase } from './src/lib/supabase.js'

async function testNotifications() {
  try {
    console.log('Testing notifications system...')
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Not authenticated:', userError)
      return
    }
    
    console.log('Current user:', user.id)
    
    // Create a test notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: user.id,
        actor_id: user.id,
        type: 'friend_request',
        reference_id: 'test-123',
        custom_message: 'This is a test notification to verify the system works',
        is_read: false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating notification:', error)
    } else {
      console.log('Test notification created:', data)
    }
    
    // Try to fetch notifications
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
    } else {
      console.log('Fetched notifications:', notifications)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testNotifications()
