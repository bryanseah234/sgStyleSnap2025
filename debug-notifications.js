// Debug script to check notifications system
import { supabase } from './src/lib/supabase.js'
import { NotificationsService } from './src/services/notificationsService.js'

async function debugNotifications() {
  try {
    console.log('🔍 Debugging notifications system...')
    
    // Check Supabase connection
    console.log('Supabase URL:', supabase.supabaseUrl)
    console.log('Supabase Key:', supabase.supabaseKey ? 'Present' : 'Missing')
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('❌ Auth error:', userError)
      return
    }
    
    if (!user) {
      console.log('⚠️ No authenticated user')
      return
    }
    
    console.log('✅ User authenticated:', user.id)
    
    // Test notifications service
    const notificationsService = new NotificationsService()
    
    // Try to get notifications
    console.log('📥 Fetching notifications...')
    const notifications = await notificationsService.getNotifications({ limit: 10 })
    console.log('📥 Notifications:', notifications)
    
    // Try to get unread count
    console.log('🔢 Getting unread count...')
    const unreadCount = await notificationsService.getUnreadCount()
    console.log('🔢 Unread count:', unreadCount)
    
    // Try to create a test notification
    console.log('➕ Creating test notification...')
    const testNotification = await notificationsService.sendNotification({
      recipient_id: user.id,
      actor_id: user.id,
      type: 'friend_request',
      reference_id: 'test-debug-123',
      custom_message: 'Debug test notification'
    })
    console.log('➕ Test notification created:', testNotification)
    
    // Fetch notifications again to see if it appears
    console.log('📥 Fetching notifications again...')
    const updatedNotifications = await notificationsService.getNotifications({ limit: 10 })
    console.log('📥 Updated notifications:', updatedNotifications)
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run the debug
debugNotifications()
