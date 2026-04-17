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
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') // Optional: for verifying webhook signatures

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
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
 * Supports multiple webhook formats including Database Webhooks and Auth Webhooks
 */
function extractAuthUserFromPayload(payload: any): AuthUser | null {
  console.log('🔍 Extracting auth user from payload...')
  console.log('Payload structure:', Object.keys(payload))
  console.log('Full payload:', JSON.stringify(payload, null, 2))
  
  // Try different webhook payload formats (in order of likelihood)
  let record: any = null

  // Format 1: Supabase Database Webhook - Edge Function type (most common)
  // When Edge Function is selected as webhook type, Supabase sends the row directly
  if (payload.id && payload.email && (payload.raw_user_meta_data || payload.user_metadata)) {
    console.log('✅ Detected Database Webhook format (Edge Function type) - direct row data')
    record = payload
  }
  // Format 2: Supabase Database Webhook - HTTP type with record field
  else if (payload.record) {
    console.log('✅ Detected Database Webhook format: record field')
    record = payload.record
  }
  // Format 3: Supabase Auth Webhook format (type: "user.created" or "user.updated")
  else if (payload.type && (payload.type === 'user.created' || payload.type === 'user.updated')) {
    console.log('✅ Detected Supabase Auth Webhook format')
    record = payload.user || payload.record
  }
  // Format 4: PostgreSQL change webhook format (new field)
  else if (payload.new) {
    console.log('✅ Detected PostgreSQL change webhook format: new field')
    record = payload.new
  }
  // Format 5: Generic data field
  else if (payload.data) {
    console.log('✅ Detected generic data field format')
    record = payload.data
  }
  // Format 6: Direct webhook format with type and table
  else if (payload.type === 'INSERT' && payload.table && payload.record) {
    console.log('✅ Detected direct webhook format with type/table')
    record = payload.record
  }
  // Format 7: Direct auth user object (has id and email)
  else if (payload.id && payload.email) {
    console.log('✅ Detected direct auth user object')
    record = payload
  }
  // Format 8: Try entire payload as record (last resort)
  else {
    console.log('⚠️ Trying entire payload as record (fallback)')
    record = payload
  }

  // Validate record has required fields
  if (!record) {
    console.error('❌ Could not extract user record from payload')
    console.error('Payload:', JSON.stringify(payload, null, 2))
    return null
  }

  if (!record.id) {
    console.error('❌ Extracted record missing required field: id')
    console.error('Record:', JSON.stringify(record, null, 2))
    return null
  }

  // Validate it's an auth user (has email or is from auth.users)
  if (!record.email && !record.raw_user_meta_data && !record.user_metadata) {
    console.warn('⚠️ Record might not be an auth user (no email or metadata)')
    // Still proceed if it has an id - might be partial data
  }

  console.log('✅ Extracted user record:', {
    id: record.id,
    email: record.email || '(no email)',
    has_metadata: !!(record.raw_user_meta_data || record.user_metadata),
    metadata_keys: record.raw_user_meta_data 
      ? Object.keys(record.raw_user_meta_data) 
      : record.user_metadata 
        ? Object.keys(record.user_metadata) 
        : []
  })

  // Extract metadata (handle both field names)
  const metadata = record.raw_user_meta_data || record.user_metadata || {}

  return {
    id: record.id,
    email: record.email,
    raw_user_meta_data: metadata,
    created_at: record.created_at,
    updated_at: record.updated_at
  }
}

/**
 * Verify webhook signature (optional but recommended for security)
 * Uses the webhook secret to verify requests are from Supabase
 */
async function verifyWebhookSignature(
  req: Request,
  body: string
): Promise<boolean> {
  // If no secret configured, skip verification (dev/testing mode only)
  if (!WEBHOOK_SECRET) {
    console.log('⚠️ WEBHOOK_SECRET not set — skipping signature verification (dev mode)')
    return true
  }

  // Secret IS configured — require svix headers; reject if absent
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('❌ WEBHOOK_SECRET is set but svix headers are missing — rejecting request')
    return false
  }

  try {
    const secret = WEBHOOK_SECRET.replace(/^v1,whsec_/, '')
    const signedPayload = `${svixId}.${svixTimestamp}.${body}`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signature = svixSignature.split(',')[1]?.split('=')[1] || svixSignature
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0))
    const dataBytes = encoder.encode(signedPayload)

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, dataBytes)

    if (!isValid) {
      console.error('❌ Webhook signature verification failed')
      return false
    }

    console.log('✅ Webhook signature verified')
    return true
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error)
    return false
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
    let bodyText: string
    try {
      bodyText = await req.text()
      console.log('📥 Raw request body length:', bodyText.length)
      console.log('📥 Raw request body (first 500 chars):', bodyText.substring(0, 500))
      
      // Log headers for debugging
      console.log('📥 Request headers:', {
        'content-type': req.headers.get('content-type'),
        'x-supabase-webhook-id': req.headers.get('x-supabase-webhook-id'),
        'user-agent': req.headers.get('user-agent')
      })
      
      // Verify webhook signature (optional but recommended)
      // Skip for Database Webhooks using Edge Function type (they're authenticated internally)
      const hasSignatureHeaders = req.headers.get('svix-id') || req.headers.get('x-supabase-webhook-id')
      if (hasSignatureHeaders && WEBHOOK_SECRET) {
        const isValid = await verifyWebhookSignature(req, bodyText)
        if (!isValid) {
          console.error('❌ Webhook signature verification failed')
          return new Response(
            JSON.stringify({ error: 'Invalid webhook signature' }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      } else {
        console.log('ℹ️ Skipping signature verification (no secret or signature headers)')
      }
      
      // Parse JSON payload
      if (!bodyText || bodyText.trim() === '') {
        console.error('❌ Empty request body')
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      payload = JSON.parse(bodyText)
      console.log('✅ Parsed payload successfully')
      console.log('📦 Payload type:', typeof payload)
      console.log('📦 Payload keys:', Object.keys(payload))
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError)
      console.error('❌ Body text:', bodyText)
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
      console.error('❌ Received payload:', JSON.stringify(payload, null, 2))
      return new Response(
        JSON.stringify({
          error: 'Invalid payload format: could not extract auth user data',
          received: payload,
          hint: 'Expected payload with id and email fields, or record/user object containing user data'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Extracted auth user:', {
      id: authUser.id,
      email: authUser.email || '(no email)',
      has_metadata: !!(authUser.raw_user_meta_data && Object.keys(authUser.raw_user_meta_data).length > 0)
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

