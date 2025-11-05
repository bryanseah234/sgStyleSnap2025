// Supabase Edge Function: Sync Auth Users to Public Users
// Deploy with: supabase functions deploy sync-auth-users-realtime --no-verify-jwt
// 
// This function handles user synchronization from auth.users to public.users
// It can be triggered via:
// 1. Database webhook (when auth.users INSERT occurs)
// 2. Direct HTTP call from frontend after authentication
// 3. Manual invocation via Supabase dashboard

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

interface AuthUser {
  id: string
  email?: string
  raw_user_meta_data?: {
    name?: string
    full_name?: string
    picture?: string
    avatar_url?: string
    sub?: string
    provider_id?: string
  }
  created_at?: string
  updated_at?: string
}

/**
 * Generate available username from email base
 */
async function generateAvailableUsername(
  supabase: any,
  base: string
): Promise<string> {
  let candidate = base
  let counter = 0
  const maxAttempts = 100 // Prevent infinite loops

  while (counter < maxAttempts) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', candidate)
      .limit(1)

    if (error) {
      console.error('Error checking username availability:', error)
      // Fallback to UUID-based username if we can't check
      return `${base}-${crypto.randomUUID().slice(0, 8)}`
    }

    if (!data || data.length === 0) {
      return candidate
    }

    counter += 1
    candidate = `${base}${counter}`
  }

  // Fallback if we hit max attempts
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}

/**
 * Upsert user from auth.users to public.users
 */
async function upsertUserFromAuth(
  supabase: any,
  authUser: AuthUser
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const id = authUser.id
    const email = authUser.email?.toLowerCase() ?? null

    if (!id) {
      return { success: false, error: 'User ID is required' }
    }

    // Generate username from email
    let username: string | null = null
    if (email) {
      const base = email.split('@')[0]
      username = await generateAvailableUsername(supabase, base)
    }

    // Extract user metadata
    const meta = authUser.raw_user_meta_data || {}
    const name = meta.name || meta.full_name || null
    const avatar_url = meta.picture || meta.avatar_url || null
    const google_id = meta.sub || meta.provider_id || null

    // Upsert user into public.users
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id,
          email,
          username,
          name,
          avatar_url,
          google_id,
          created_at: authUser.created_at || new Date().toISOString(),
          updated_at: authUser.updated_at || new Date().toISOString()
        },
        {
          onConflict: 'id'
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Failed to upsert user:', error)
      return { success: false, error: error.message }
    }

    console.info('✅ Successfully upserted user:', {
      id,
      email,
      username
    })

    return { success: true, user: data }
  } catch (err) {
    console.error('Exception in upsertUserFromAuth:', err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    return { success: false, error: errorMessage }
  }
}

/**
 * Extract auth user from webhook payload
 * Supports multiple webhook formats
 */
function extractAuthUserFromPayload(payload: any): AuthUser | null {
  // Try different webhook payload formats
  let record: any = null

  if (payload.record) {
    // Supabase database webhook format
    record = payload.record
  } else if (payload.new) {
    // PostgreSQL change webhook format
    record = payload.new
  } else if (payload.data) {
    // Generic data field
    record = payload.data
  } else if (payload.type === 'INSERT' && payload.table === 'users' && payload.record) {
    // Direct webhook format
    record = payload.record
  } else if (payload.id && payload.email) {
    // Direct auth user object
    record = payload
  } else {
    // Try entire payload as record
    record = payload
  }

  if (!record || !record.id) {
    return null
  }

  return {
    id: record.id,
    email: record.email,
    raw_user_meta_data: record.raw_user_meta_data || record.user_metadata,
    created_at: record.created_at,
    updated_at: record.updated_at
  }
}

serve(async (req) => {
  const startTime = Date.now()
  console.log('🔄 ========== SYNC AUTH USERS FUNCTION CALLED ==========')
  console.log('Method:', req.method)
  console.log('URL:', req.url)

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Check environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    console.log('✅ Supabase client created')

    // Handle GET request (health check)
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'sync-auth-users-realtime running',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle POST request (sync user)
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    let payload: any
    try {
      const bodyText = await req.text()
      console.log('Raw request body:', bodyText)
      payload = JSON.parse(bodyText)
      console.log('Parsed payload:', JSON.stringify(payload, null, 2))
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError)
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract auth user from payload
    const authUser = extractAuthUserFromPayload(payload)

    if (!authUser) {
      console.error('❌ Invalid payload format: could not extract auth user')
      return new Response(
        JSON.stringify({
          error: 'Invalid payload format: could not extract auth user data',
          received: payload
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Extracted auth user:', {
      id: authUser.id,
      email: authUser.email
    })

    // Sync user
    const result = await upsertUserFromAuth(supabase, authUser)

    const duration = Date.now() - startTime
    console.log('🔄 ========== FUNCTION COMPLETE ==========')
    console.log('Duration:', duration, 'ms')
    console.log('Success:', result.success)

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.success ? 'User synced successfully' : result.error,
        user: result.user,
        debug: {
          userId: authUser.id,
          duration
        }
      }),
      {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ ========== FUNCTION ERROR ==========')
    console.error('Error:', error)
    console.error('Duration:', duration, 'ms')

    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({
        error: errorMessage,
        debug: {
          duration,
          errorType: error instanceof Error ? error.constructor.name : typeof error
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

