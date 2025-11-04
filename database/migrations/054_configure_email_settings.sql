-- Migration 054: Configure Email Notification Settings
-- This sets up the database settings needed for email notifications
-- Date: January 2025
--
-- IMPORTANT: Replace the placeholders with your actual values!
-- 1. Replace YOUR_PROJECT_REF with your Supabase project reference (found in Dashboard URL)
-- 2. Replace YOUR_SERVICE_ROLE_KEY with your service role key (found in Dashboard → Settings → API)

BEGIN;

-- Step 1: Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Create configuration table to store Supabase settings
-- (Alternative to ALTER DATABASE which requires superuser)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Supabase configuration
-- IMPORTANT: Replace the placeholders with your actual values!
-- 1. Replace YOUR_PROJECT_REF with your Supabase project reference (from Dashboard URL)
-- 2. Replace YOUR_SERVICE_ROLE_KEY with your service role key (Dashboard → Settings → API → service_role key)
-- 
-- After running this migration, you MUST manually insert the actual values:
-- 
-- INSERT INTO app_config (key, value) 
-- VALUES 
--   ('supabase_url', 'https://YOUR_PROJECT_REF.supabase.co'),
--   ('supabase_service_key', 'YOUR_SERVICE_ROLE_KEY')
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
--
-- Do NOT commit actual keys to version control!

-- Step 4: Apply the improved trigger function (from migration 052)
-- This will now properly update email_status even if there are errors
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

  -- Get Supabase URL from config table
  SELECT value INTO supabase_url FROM app_config WHERE key = 'supabase_url';
  
  -- Fallback to database settings if config table doesn't have it
  IF supabase_url IS NULL OR supabase_url = '' THEN
    BEGIN
      supabase_url := current_setting('app.settings.supabase_url', TRUE);
    EXCEPTION WHEN OTHERS THEN
      supabase_url := '';
    END;
  END IF;

  -- Construct Edge Function URL
  IF supabase_url != '' AND position('.supabase.co' in supabase_url) > 0 THEN
    edge_function_url := replace(supabase_url, '.supabase.co', '.functions.supabase.co') || '/functions/v1/send-email-notification';
  ELSE
    error_msg := 'Supabase URL not configured. Please set app.settings.supabase_url';
    RAISE WARNING 'Email trigger: %', error_msg;
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Get service role key from config table
  SELECT value INTO service_role_key FROM app_config WHERE key = 'supabase_service_key';
  
  -- Fallback to database settings if config table doesn't have it
  IF service_role_key IS NULL OR service_role_key = '' THEN
    BEGIN
      service_role_key := current_setting('app.settings.supabase_service_key', TRUE);
    EXCEPTION WHEN OTHERS THEN
      service_role_key := '';
    END;
  END IF;
  
  IF service_role_key IS NULL OR service_role_key = '' THEN
    error_msg := 'Supabase service role key not configured. Please set in app_config table';
    RAISE WARNING 'Email trigger: %', error_msg;
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Build payload
  payload := jsonb_build_object(
    'id', NEW.id,
    'recipient_id', NEW.recipient_id,
    'actor_id', NEW.actor_id,
    'type', NEW.type,
    'reference_id', NEW.reference_id,
    'message', NEW.custom_message,
    'created_at', NEW.created_at
  );

  -- Call Edge Function
  BEGIN
    SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key,
        'apikey', service_role_key
      )::jsonb,
      body := payload::text
    ) INTO request_id;

    UPDATE notifications 
    SET email_status = 'email_queued'
    WHERE id = NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    error_msg := 'Failed to queue email: ' || SQLERRM;
    RAISE WARNING 'Email trigger error: %', error_msg;
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;
CREATE TRIGGER trigger_send_email_notification
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION send_email_notification();

COMMIT;

-- Verify settings
DO $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  SELECT value INTO supabase_url FROM app_config WHERE key = 'supabase_url';
  SELECT value INTO service_key FROM app_config WHERE key = 'supabase_service_key';
  
  IF supabase_url IS NULL OR supabase_url = '' OR supabase_url LIKE '%YOUR_PROJECT_REF%' THEN
    RAISE WARNING '⚠️  Supabase URL not configured! Check app_config table.';
  ELSE
    RAISE NOTICE '✅ Supabase URL configured: %', supabase_url;
  END IF;
  
  IF service_key IS NULL OR service_key = '' OR service_key LIKE '%YOUR_SERVICE_ROLE_KEY%' THEN
    RAISE WARNING '⚠️  Service role key not configured! Check app_config table.';
  ELSE
    RAISE NOTICE '✅ Service role key configured (length: %)', length(service_key);
  END IF;
END $$;

