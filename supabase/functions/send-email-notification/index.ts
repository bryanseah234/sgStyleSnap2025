// Supabase Edge Function: Send Email Notifications
// Deploy with: supabase functions deploy send-email-notification --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface NotificationData {
  id: string
  recipient_id: string
  actor_id?: string
  type: string
  reference_id?: string
  message?: string
  created_at: string
}

interface EmailTemplate {
  subject: string
  html: string
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

/**
 * Get email templates for different notification types
 */
function getEmailTemplate(notificationType: string, actorName: string = 'A user'): EmailTemplate | null {
  const templates: Record<string, EmailTemplate> = {
    friend_request: {
      subject: 'You received a friend request on StyleSnap',
      html: `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="margin:0 0 12px; color:#1f2937;">New friend request 👋</h2>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">${actorName} sent you a friend request on StyleSnap.</p>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">Open the app to accept or decline.</p>
          <div style="margin-top:24px; padding-top:24px; border-top:1px solid #e5e7eb;">
            <p style="margin:0; color:#6b7280; font-size:14px;">You're receiving this email because you have email notifications enabled.</p>
          </div>
        </div>
      `
    },
    friend_request_accepted: {
      subject: 'Your friend request was accepted on StyleSnap',
      html: `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="margin:0 0 12px; color:#1f2937;">Friend request accepted 🎉</h2>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">${actorName} accepted your friend request on StyleSnap.</p>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">You can now view each other's closets and create outfits together!</p>
          <div style="margin-top:24px; padding-top:24px; border-top:1px solid #e5e7eb;">
            <p style="margin:0; color:#6b7280; font-size:14px;">You're receiving this email because you have email notifications enabled.</p>
          </div>
        </div>
      `
    },
    outfit_like: {
      subject: 'Someone liked your outfit on StyleSnap',
      html: `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="margin:0 0 12px; color:#1f2937;">Your outfit got a like ❤️</h2>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">${actorName} liked your outfit on StyleSnap.</p>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">Open the app to see which outfit they liked.</p>
          <div style="margin-top:24px; padding-top:24px; border-top:1px solid #e5e7eb;">
            <p style="margin:0; color:#6b7280; font-size:14px;">You're receiving this email because you have email notifications enabled.</p>
          </div>
        </div>
      `
    },
    item_like: {
      subject: 'Someone liked your item on StyleSnap',
      html: `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="margin:0 0 12px; color:#1f2937;">Your item got a like ❤️</h2>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">${actorName} liked an item in your closet on StyleSnap.</p>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">Open the app to see which item they liked.</p>
          <div style="margin-top:24px; padding-top:24px; border-top:1px solid #e5e7eb;">
            <p style="margin:0; color:#6b7280; font-size:14px;">You're receiving this email because you have email notifications enabled.</p>
          </div>
        </div>
      `
    },
    outfit_shared: {
      subject: 'A friend shared an outfit with you on StyleSnap',
      html: `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="margin:0 0 12px; color:#1f2937;">Outfit shared with you 👗</h2>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">${actorName} shared an outfit with you on StyleSnap.</p>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">Open the app to view the shared outfit.</p>
          <div style="margin-top:24px; padding-top:24px; border-top:1px solid #e5e7eb;">
            <p style="margin:0; color:#6b7280; font-size:14px;">You're receiving this email because you have email notifications enabled.</p>
          </div>
        </div>
      `
    },
    friend_outfit_suggestion: {
      subject: 'You have an outfit suggestion on StyleSnap',
      html: `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="margin:0 0 12px; color:#1f2937;">Outfit suggestion 💡</h2>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">${actorName} created an outfit suggestion using items from your closet.</p>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">Open the app to approve or reject the suggestion.</p>
          <div style="margin-top:24px; padding-top:24px; border-top:1px solid #e5e7eb;">
            <p style="margin:0; color:#6b7280; font-size:14px;">You're receiving this email because you have email notifications enabled.</p>
          </div>
        </div>
      `
    },
    outfit_comment: {
      subject: 'New comment on your outfit on StyleSnap',
      html: `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="margin:0 0 12px; color:#1f2937;">New comment 💬</h2>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">${actorName} commented on your outfit on StyleSnap.</p>
          <p style="margin:0 0 12px; color:#374151; font-size:16px;">Open the app to view and reply to the comment.</p>
          <div style="margin-top:24px; padding-top:24px; border-top:1px solid #e5e7eb;">
            <p style="margin:0; color:#6b7280; font-size:14px;">You're receiving this email because you have email notifications enabled.</p>
          </div>
        </div>
      `
    }
  }

  return templates[notificationType] || null
}

/**
 * Send email via Brevo API
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  notificationId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'StyleSnap',
          email: 'no-reply@stylesnap.app'
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        headers: {
          'X-Notification-ID': notificationId || '',
          'X-Notification-Type': 'email'
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if user should receive email notification
 */
async function shouldSendEmail(
  supabase: any,
  userId: string,
  notificationType: string
): Promise<boolean> {
  try {
    // Get user preferences
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('email_enabled, friend_requests, friend_accepted, outfit_likes, item_likes, outfit_comments, friend_outfit_suggestions')
      .eq('user_id', userId)
      .single()

    // If no preferences, default to enabled (new users get emails by default)
    if (error || !preferences) {
      return true
    }

    // Check if emails are enabled (column may not exist in older migrations, default to true)
    if (preferences.email_enabled === false) {
      return false
    }
    
    // If email_enabled column doesn't exist, it will be null, default to true
    if (preferences.email_enabled === null) {
      return true
    }

    // Check type-specific preferences
    switch (notificationType) {
      case 'friend_request':
        return preferences.friend_requests !== false
      case 'friend_request_accepted':
        return preferences.friend_accepted !== false
      case 'outfit_like':
        return preferences.outfit_likes !== false
      case 'item_like':
        return preferences.item_likes !== false
      case 'outfit_comment':
        return preferences.outfit_comments !== false
      case 'friend_outfit_suggestion':
      case 'outfit_shared':
        return preferences.friend_outfit_suggestions !== false
      default:
        return true
    }
  } catch (error) {
    console.error('Error checking email preferences:', error)
    // Default to sending on error
    return true
  }
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Parse request body
    const notificationData: NotificationData = await req.json()

    // Validate required fields
    if (!notificationData.id || !notificationData.recipient_id || !notificationData.type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id, recipient_id, type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user should receive email
    const shouldSend = await shouldSendEmail(
      supabase,
      notificationData.recipient_id,
      notificationData.type
    )

    if (!shouldSend) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email skipped due to user preferences' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get recipient user info (for email)
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', notificationData.recipient_id)
      .single()

    if (recipientError || !recipient || !recipient.email) {
      return new Response(
        JSON.stringify({ error: 'Recipient user not found or has no email' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get actor info (if exists)
    let actorName = 'A user'
    if (notificationData.actor_id) {
      const { data: actor } = await supabase
        .from('users')
        .select('name')
        .eq('id', notificationData.actor_id)
        .single()

      if (actor && actor.name) {
        actorName = actor.name
      }
    }

    // Get email template
    const template = getEmailTemplate(notificationData.type, actorName)
    if (!template) {
      return new Response(
        JSON.stringify({ success: true, message: `No email template for type: ${notificationData.type}` }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send email
    const emailResult = await sendEmail(
      recipient.email,
      template.subject,
      template.html,
      notificationData.id
    )

    // Update notification email status
    if (emailResult.success) {
      await supabase
        .from('notifications')
        .update({
          email_status: 'email_sent',
          email_sent_at: new Date().toISOString()
        })
        .eq('id', notificationData.id)
    } else {
      await supabase
        .from('notifications')
        .update({
          email_status: 'email_error',
          email_error: emailResult.error?.slice(0, 500)
        })
        .eq('id', notificationData.id)
    }

    return new Response(
      JSON.stringify({
        success: emailResult.success,
        message: emailResult.success ? 'Email sent successfully' : emailResult.error
      }),
      {
        status: emailResult.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in send-email-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

