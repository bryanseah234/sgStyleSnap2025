/**
 * Supabase Client Configuration - StyleSnap
 * 
 * Purpose: Centralized Supabase client initialization
 * 
 * This file creates and exports a single Supabase client instance
 * used across all services and components in the application.
 * 
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * 
 * Setup:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key from Settings > API
 * 3. Add them to your .env.local file
 * 
 * Usage:
 * import { supabase } from '@/config/supabase'
 * const { data, error } = await supabase.from('table').select()
 * 
 * Reference:
 * - .env.example for environment variables template
 * - docs/DEPLOYMENT_GUIDE.md for production setup
 * - tasks/01-infrastructure-setup.md for initial setup
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check for missing credentials and provide helpful error message
const hasCredentials = supabaseUrl && supabaseAnonKey

if (!hasCredentials) {
  console.error('⚠️  Missing Supabase credentials!')
  console.error('📝 Please create a .env file with:')
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co')
  console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key')
  console.error('💡 Copy .env.example to .env and fill in your values')
}

/**
 * Supabase client instance
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = hasCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null // Return null if no credentials - app will show error page

if (supabase) window.supabase = supabase

// Export flag for checking if Supabase is configured
export const isSupabaseConfigured = hasCredentials
