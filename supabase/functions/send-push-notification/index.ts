// Supabase Edge Function: Send Push Notifications
// STATUS: NOT IMPLEMENTED — VAPID ES256 signing is not yet implemented.
// This function returns 501 until proper VAPID JWT signing is added.
// TODO: Implement ES256 JWT signing with SubtleCrypto API before enabling.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({
      error: 'Push notifications not yet implemented',
      detail: 'VAPID ES256 JWT signing is required but not yet implemented. This feature is pending.',
      status: 501
    }),
    {
      status: 501,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
})
