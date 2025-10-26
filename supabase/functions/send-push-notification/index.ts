// Supabase Edge Function: Send Push Notifications
// Deploy with: supabase functions deploy send-push-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@stylesnap.app'

interface PushPayload {
  notification_id?: string
  user_id: string
  type: string
  title: string
  body: string
  data?: Record<string, any>
  icon?: string
  badge?: string
  image?: string
  tag?: string
  requireInteraction?: boolean
}

/**
 * Send push notification to user's devices
 */
serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Authenticate request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    // Verify user authentication
    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const payload: PushPayload = await req.json()

    // Validate payload
    if (!payload.user_id || !payload.type || !payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, type, title, body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user should receive notification (preferences)
    const { data: shouldSend } = await supabaseClient.rpc('should_send_notification', {
      p_user_id: payload.user_id,
      p_notification_type: payload.type
    })

    if (!shouldSend) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Notification skipped due to user preferences'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user's active push subscriptions
    const { data: subscriptions, error: subError } = await supabaseClient.rpc(
      'get_user_push_subscriptions',
      { p_user_id: payload.user_id }
    )

    if (subError || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active subscriptions for user'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Build notification payload
    const notificationPayload = {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        image: payload.image,
        tag: payload.tag || `stylesnap-${payload.type}-${Date.now()}`,
        requireInteraction: payload.requireInteraction || false,
        data: {
          ...payload.data,
          type: payload.type,
          notification_id: payload.notification_id,
          timestamp: Date.now()
        }
      }
    }

    // Send push notification to each subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: any) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          }

          // Send push using web-push compatible API
          const response = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': generateVapidAuthHeader(subscription.endpoint),
              'TTL': '86400' // 24 hours
            },
            body: JSON.stringify(notificationPayload)
          })

          if (!response.ok) {
            throw new Error(`Push failed: ${response.status}`)
          }

          // Log successful delivery
          await supabaseClient.from('notification_delivery_log').insert({
            notification_id: payload.notification_id,
            user_id: payload.user_id,
            subscription_id: subscription.id,
            status: 'sent'
          })

          // Reset failed count on success
          await supabaseClient.rpc('reset_subscription_failed_count', {
            p_subscription_id: subscription.id
          })

          return { success: true, subscription_id: subscription.id }
        } catch (error) {
          console.error('Push failed:', error)

          // Log failed delivery
          await supabaseClient.from('notification_delivery_log').insert({
            notification_id: payload.notification_id,
            user_id: payload.user_id,
            subscription_id: subscription.id,
            status: 'failed',
            error_message: error.message
          })

          // Mark subscription as failed
          await supabaseClient.rpc('mark_subscription_failed', {
            p_subscription_id: subscription.id,
            p_error_message: error.message
          })

          return { success: false, subscription_id: subscription.id, error: error.message }
        }
      })
    )

    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length
    const failureCount = results.length - successCount

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: successCount,
        failed_count: failureCount,
        results: results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason }))
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error sending push notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Generate VAPID authorization header
 */
function generateVapidAuthHeader(endpoint: string): string {
  // Extract origin from endpoint
  const url = new URL(endpoint)
  const origin = `${url.protocol}//${url.host}`

  // Generate JWT token (simplified - use a proper JWT library in production)
  const header = {
    alg: 'ES256',
    typ: 'JWT'
  }

  const payload = {
    aud: origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: VAPID_SUBJECT
  }

  // In production, use proper JWT signing with VAPID keys
  // This is a placeholder - implement proper JWT signing
  const token = `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.signature`

  return `vapid t=${token}, k=${VAPID_PUBLIC_KEY}`
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}
