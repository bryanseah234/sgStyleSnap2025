-- Migration 050: Email Notifications System
-- This file is re-runnable - safe to execute multiple times
-- Date: January 2025
--
-- Features:
--   1. Add email notification preferences
--   2. Add email status tracking to notifications table
--   3. Create trigger function to send emails via Edge Function
--   4. Set up automatic email sending on notification creation

-- =============================================================================
-- 1. ADD EMAIL PREFERENCES TO notification_preferences TABLE
-- =============================================================================

ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN notification_preferences.email_enabled IS 'Whether user wants to receive email notifications (default: true)';

-- =============================================================================
-- 2. ADD EMAIL STATUS TRACKING TO notifications TABLE
-- =============================================================================

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS email_status VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_error TEXT DEFAULT NULL;

COMMENT ON COLUMN notifications.email_status IS 'Status of email sending: NULL (not attempted), email_sent, email_error';
COMMENT ON COLUMN notifications.email_sent_at IS 'Timestamp when email was successfully sent';
COMMENT ON COLUMN notifications.email_error IS 'Error message if email sending failed';

-- Create index for email status queries
CREATE INDEX IF NOT EXISTS idx_notifications_email_status ON notifications(email_status) WHERE email_status IS NOT NULL;

-- =============================================================================
-- 3. CREATE FUNCTION TO CALL EDGE FUNCTION FOR EMAIL SENDING
-- =============================================================================

-- Use pg_net extension (Supabase's built-in HTTP client)
CREATE OR REPLACE FUNCTION send_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
  payload JSONB;
  request_id BIGINT;
BEGIN
  -- Only send email for new notifications (not updates)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Get Supabase URL and construct Edge Function URL
  supabase_url := current_setting('app.settings.supabase_url', TRUE);
  IF supabase_url IS NULL OR supabase_url = '' THEN
    -- Try to get from Supabase project settings
    supabase_url := coalesce(
      current_setting('app.supabase_url', TRUE),
      '' -- Will be set via database configuration
    );
  END IF;

  -- Construct Edge Function URL
  IF supabase_url != '' AND position('.supabase.co' in supabase_url) > 0 THEN
    edge_function_url := replace(supabase_url, '.supabase.co', '.functions.supabase.co') || '/functions/v1/send-email-notification';
  ELSE
    -- Fallback: construct from project reference
    edge_function_url := 'https://YOUR_PROJECT_REF.functions.supabase.co/functions/v1/send-email-notification';
  END IF;

  -- Get service role key for authentication
  service_role_key := current_setting('app.settings.supabase_service_key', TRUE);

  -- Build payload for Edge Function
  payload := jsonb_build_object(
    'id', NEW.id,
    'recipient_id', NEW.recipient_id,
    'actor_id', NEW.actor_id,
    'type', NEW.type,
    'reference_id', NEW.reference_id,
    'message', NEW.message,
    'created_at', NEW.created_at
  );

  -- Call Edge Function using pg_net (Supabase's HTTP extension)
  BEGIN
    -- Make async HTTP POST request
    SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', COALESCE('Bearer ' || service_role_key, ''),
        'apikey', COALESCE(service_role_key, '')
      )::jsonb,
      body := payload::text
    ) INTO request_id;

    -- Log success (request is async, so we don't wait for response)
    RAISE LOG 'Email notification request queued: notification_id=%, request_id=%', NEW.id, request_id;
  EXCEPTION WHEN OTHERS THEN
    -- If pg_net is not available or fails, log warning but don't fail transaction
    -- Email will be sent via manual webhook or retry mechanism if needed
    RAISE WARNING 'Could not queue email notification for notification_id=%. Error: %. Edge Function will be called via webhook if configured.', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION send_email_notification() IS 'Triggers email sending via Edge Function when notification is created';

-- =============================================================================
-- 4. CREATE TRIGGER TO AUTOMATICALLY SEND EMAILS
-- =============================================================================

DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;
CREATE TRIGGER trigger_send_email_notification
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION send_email_notification();

COMMENT ON TRIGGER trigger_send_email_notification ON notifications IS 'Automatically sends email notification when new notification is created';

-- =============================================================================
-- 5. WEBHOOK ALTERNATIVE (Recommended for production)
-- =============================================================================
-- If pg_net triggers don't work reliably, set up a Supabase webhook:
--
-- 1. Go to Supabase Dashboard > Database > Webhooks
-- 2. Create new webhook on 'notifications' table, INSERT events
-- 3. Point to: https://YOUR_PROJECT.functions.supabase.co/functions/v1/send-email-notification
-- 4. Use service role key for authentication
-- 5. Disable the trigger above if using webhooks:
--    DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;

-- =============================================================================
-- 6. UPDATE NOTIFICATION PREFERENCES DEFAULT
-- =============================================================================

-- Set default email_enabled for existing users without preferences
INSERT INTO notification_preferences (user_id, email_enabled)
SELECT id, TRUE
FROM users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. Edge Function URL Configuration:
--    - Set via Supabase dashboard: Settings > Edge Functions > URL
--    - Or use environment variable: app.settings.edge_function_url
--
-- 2. Email Preferences:
--    - Users can disable emails via notification_preferences.email_enabled
--    - Type-specific preferences also checked in Edge Function
--
-- 3. Email Status Tracking:
--    - email_status: NULL (not attempted), 'email_sent', 'email_error'
--    - email_sent_at: timestamp of successful send
--    - email_error: error message if send failed
--
-- 4. Deployment:
--    - Deploy Edge Function: supabase functions deploy send-email-notification
--    - Set BREVO_API_KEY in Supabase Edge Function secrets
--    - Ensure pg_net extension is enabled (or use http extension alternative)

