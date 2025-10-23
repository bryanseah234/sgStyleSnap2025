// Simple test to check if notifications table exists and has data
import { createClient } from '@supabase/supabase-js'

// You'll need to set these environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nztqjmknblelnzpeatyx.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56dHFqbWtucmJsZWxuenBlYXR5eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM4MDQ5NjQwLCJleHAiOjIwNTM2MjU2NDB9.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'

async function testNotificationsTable() {
  try {
    console.log('🔍 Testing notifications table...')
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if notifications table exists
    console.log('📋 Checking notifications table structure...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'notifications')
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError)
      return
    }
    
    console.log('📋 Notifications table exists:', tables.length > 0)
    
    if (tables.length > 0) {
      // Check table structure
      console.log('📋 Checking table structure...')
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'notifications')
      
      if (columnsError) {
        console.error('❌ Error checking columns:', columnsError)
      } else {
        console.log('📋 Table columns:', columns)
      }
      
      // Try to count notifications (this should work without auth)
      console.log('📊 Counting notifications...')
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.error('❌ Error counting notifications:', countError)
      } else {
        console.log('📊 Total notifications:', count)
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testNotificationsTable()
