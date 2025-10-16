import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to handle Supabase errors
export function handleSupabaseError(error, operation = 'operation') {
  console.error(`Supabase ${operation} error:`, error)
  
  if (error.code === 'PGRST116') {
    throw new Error('No data found')
  } else if (error.code === '23505') {
    throw new Error('Item already exists')
  } else if (error.code === '23503') {
    throw new Error('Referenced item not found')
  } else if (error.message?.includes('JWT')) {
    throw new Error('Authentication required')
  } else if (error.message?.includes('permission')) {
    throw new Error('Permission denied')
  }
  
  throw new Error(error.message || `Failed to ${operation}`)
}

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get current user profile
export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) handleSupabaseError(error, 'get user profile')
  return data
}
