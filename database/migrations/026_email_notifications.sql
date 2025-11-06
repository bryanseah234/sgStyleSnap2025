-- ============================================
-- Migration 026: Email Notifications System
-- ============================================
-- Purpose: Comprehensive email notification system for sending emails via Edge Functions
-- Dependencies: 009_notifications_system.sql, 010_push_notifications.sql
-- Creates:
--   - email_enabled column in notification_preferences
--   - email_status, email_sent_at, email_error columns in notifications table
--   - send_email_notification() function
--   - trigger_send_email_notification trigger
--   - app_config table (if not exists)
-- Modifies:
--   - notification_preferences table (adds email_enabled)
--   - notifications table (adds email tracking columns)
-- 
-- IMPORTANT: Run migrations in sequential order!
-- NOTE: This system uses Supabase Edge Functions. Configure webhooks or pg_net extension.
-- ============================================

-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- STEP 1: ENABLE PG_NET EXTENSION
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- STEP 2: CREATE APP_CONFIG TABLE (IF NOT EXISTS)
-- ============================================

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions on app_config table
GRANT SELECT ON app_config TO service_role;
GRANT SELECT ON app_config TO postgres;
GRANT SELECT ON app_config TO authenticated;

-- ============================================
-- STEP 3: ADD EMAIL PREFERENCES TO notification_preferences
-- ============================================

ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN notification_preferences.email_enabled IS 'Whether user wants to receive email notifications (default: false, enabled after 5 friends)';

-- ============================================
-- STEP 4: ADD EMAIL STATUS TRACKING TO notifications
-- ============================================

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS email_status VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_error TEXT DEFAULT NULL;

COMMENT ON COLUMN notifications.email_status IS 'Status of email sending: NULL (not attempted), email_queued, email_sent, email_error';
COMMENT ON COLUMN notifications.email_sent_at IS 'Timestamp when email was successfully sent';
COMMENT ON COLUMN notifications.email_error IS 'Error message if email sending failed';

-- Create index for email status queries
CREATE INDEX IF NOT EXISTS idx_notifications_email_status ON notifications(email_status) WHERE email_status IS NOT NULL;

-- ============================================
-- STEP 5: CREATE EMAIL NOTIFICATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION send_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
  payload JSONB;
  request_id BIGINT;
  error_msg TEXT;
BEGIN
  -- Only send email for new notifications (not updates)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  RAISE LOG 'Email trigger: Processing notification ID: %, type: %, recipient: %', NEW.id, NEW.type, NEW.recipient_id;

  -- Get Supabase URL from app_config table FIRST
  SELECT value INTO supabase_url FROM app_config WHERE key = 'supabase_url';
  
  -- Fallback: Try to get from project_ref
  IF supabase_url IS NULL OR supabase_url = '' THEN
    SELECT value INTO supabase_url FROM app_config WHERE key = 'project_ref';
    IF supabase_url IS NOT NULL AND supabase_url != '' THEN
      supabase_url := 'https://' || supabase_url || '.supabase.co';
    END IF;
  END IF;
  
  -- Final fallback: Try database settings (requires superuser)
  IF supabase_url IS NULL OR supabase_url = '' THEN
    BEGIN
      supabase_url := current_setting('app.settings.supabase_url', TRUE);
    EXCEPTION WHEN OTHERS THEN
      supabase_url := '';
    END;
  END IF;

  -- Construct Edge Function URL
  IF supabase_url IS NOT NULL AND supabase_url != '' AND position('.supabase.co' in supabase_url) > 0 THEN
    edge_function_url := replace(supabase_url, '.supabase.co', '.functions.supabase.co') || '/functions/v1/send-email-notification';
    RAISE LOG 'Email trigger: Constructed Edge Function URL: %', edge_function_url;
  ELSE
    error_msg := 'Supabase URL not configured in app_config table. Please configure via: INSERT INTO app_config (key, value) VALUES (''supabase_url'', ''https://YOUR_PROJECT_REF.supabase.co'') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;';
    RAISE WARNING 'Email trigger: %', error_msg;
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Get service role key from app_config table
  SELECT value INTO service_role_key FROM app_config WHERE key = 'supabase_service_key';
  
  -- Fallback: Try database settings
  IF service_role_key IS NULL OR service_role_key = '' THEN
    BEGIN
      service_role_key := current_setting('app.settings.supabase_service_key', TRUE);
    EXCEPTION WHEN OTHERS THEN
      service_role_key := '';
    END;
  END IF;
  
  IF service_role_key IS NULL OR service_role_key = '' THEN
    error_msg := 'Supabase service role key not configured in app_config table. Please configure via: INSERT INTO app_config (key, value) VALUES (''supabase_service_key'', ''YOUR_SERVICE_ROLE_KEY'') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;';
    RAISE WARNING 'Email trigger: %', error_msg;
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Build payload for Edge Function
  -- NOTE: Uses custom_message field (not message) - see migration 051 fix
  payload := jsonb_build_object(
    'id', NEW.id,
    'recipient_id', NEW.recipient_id,
    'actor_id', NEW.actor_id,
    'type', NEW.type,
    'reference_id', NEW.reference_id,
    'message', NEW.custom_message,
    'created_at', NEW.created_at
  );

  RAISE LOG 'Email trigger: Payload prepared: %', payload::text;

  -- Call Edge Function using pg_net (async HTTP POST)
  -- Try different pg_net function signatures for compatibility
  BEGIN
    BEGIN
      -- Method 1: Named parameters (newer pg_net)
      SELECT net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key,
          'apikey', service_role_key
        )::jsonb,
        body := payload::text
      ) INTO request_id;
      
      RAISE LOG 'Email trigger: HTTP request queued (method 1), request_id: %', request_id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Method 2: Positional parameters
      BEGIN
        SELECT net.http_post(
          edge_function_url,
          jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key,
            'apikey', service_role_key
          )::jsonb,
          payload::text
        ) INTO request_id;
        
        RAISE LOG 'Email trigger: HTTP request queued (method 2), request_id: %', request_id;
        
      EXCEPTION WHEN OTHERS THEN
        -- If pg_net fails, mark as error but don't fail transaction
        RAISE;
      END;
    END;

    -- Mark as queued
    UPDATE notifications 
    SET email_status = 'email_queued'
    WHERE id = NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- If pg_net is not available or fails, log detailed error
    error_msg := 'Failed to queue email via pg_net: ' || SQLERRM || ' (SQLSTATE: ' || SQLSTATE || ')';
    RAISE WARNING 'Email trigger: %', error_msg;
    RAISE WARNING 'Email trigger: Edge Function URL: %', edge_function_url;
    RAISE WARNING 'Email trigger: Consider using Supabase webhooks instead of triggers';
    
    -- Update notification with error
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION send_email_notification() IS 'Triggers email sending via Edge Function when notification is created. Uses app_config table for configuration.';

-- ============================================
-- STEP 6: CREATE TRIGGER (OPTIONAL - Webhooks Preferred)
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;

-- Create trigger (can be disabled if using webhooks instead)
CREATE TRIGGER trigger_send_email_notification
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION send_email_notification();

COMMENT ON TRIGGER trigger_send_email_notification ON notifications IS 'Automatically sends email notification when new notification is created. Can be disabled if using Supabase webhooks instead.';

-- ============================================
-- STEP 7: UPDATE NOTIFICATION PREFERENCES DEFAULT
-- ============================================

-- Set default email_enabled for existing users without preferences
-- Only enable for users with 5+ friends, otherwise keep disabled
INSERT INTO notification_preferences (user_id, email_enabled)
SELECT 
  u.id,
  CASE 
    WHEN (SELECT COUNT(*) FROM friends 
          WHERE (requester_id = u.id OR receiver_id = u.id) 
          AND status = 'accepted') >= 5 
    THEN TRUE 
    ELSE FALSE 
  END
FROM users u
WHERE u.id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify app_config table exists
DO $$
DECLARE
  config_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'app_config'
  ) INTO config_exists;
  
  IF config_exists THEN
    RAISE NOTICE '✅ app_config table exists';
  ELSE
    RAISE WARNING '⚠️ app_config table not found';
  END IF;
END $$;

-- Verify columns were added
DO $$
DECLARE
  email_enabled_exists BOOLEAN;
  email_status_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' AND column_name = 'email_enabled'
  ) INTO email_enabled_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'email_status'
  ) INTO email_status_exists;
  
  IF email_enabled_exists THEN
    RAISE NOTICE '✅ email_enabled column added to notification_preferences';
  ELSE
    RAISE WARNING '⚠️ email_enabled column not found';
  END IF;
  
  IF email_status_exists THEN
    RAISE NOTICE '✅ email_status columns added to notifications';
  ELSE
    RAISE WARNING '⚠️ email_status columns not found';
  END IF;
END $$;

-- Verify function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'send_email_notification'
  ) THEN
    RAISE NOTICE '✅ send_email_notification function exists';
  ELSE
    RAISE WARNING '⚠️ send_email_notification function not found';
  END IF;
END $$;

-- ============================================
-- CONFIGURATION INSTRUCTIONS
-- ============================================
-- 
-- After running this migration, configure email notifications:
-- 
-- 1. Set Supabase URL:
--    INSERT INTO app_config (key, value) 
--    VALUES ('supabase_url', 'https://YOUR_PROJECT_REF.supabase.co')
--    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
-- 
-- 2. Set Service Role Key:
--    INSERT INTO app_config (key, value) 
--    VALUES ('supabase_service_key', 'YOUR_SERVICE_ROLE_KEY')
--    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
-- 
-- 3. Deploy Edge Function:
--    supabase functions deploy send-email-notification --no-verify-jwt
-- 
-- 4. (Optional) Use Webhooks Instead of Triggers:
--    - Go to Supabase Dashboard → Database → Webhooks
--    - Create webhook on notifications table (INSERT events)
--    - Point to: https://YOUR_PROJECT.functions.supabase.co/functions/v1/send-email-notification
--    - Then disable trigger: DROP TRIGGER trigger_send_email_notification ON notifications;
-- 
-- See migration 032_email_notification_fixes.sql for disabling triggers/webhook setup

