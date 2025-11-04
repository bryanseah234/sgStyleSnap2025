-- Migration 055: Fix Email Trigger to Read from app_config Table
-- This ensures the trigger function reads from the app_config table
-- Date: January 2025

BEGIN;

-- Drop and recreate the function to ensure it uses the config table
DROP FUNCTION IF EXISTS send_email_notification() CASCADE;

CREATE FUNCTION send_email_notification()
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

  -- Get Supabase URL from config table FIRST
  SELECT value INTO supabase_url FROM app_config WHERE key = 'supabase_url';
  
  -- If not found in config table, try to construct from project reference
  IF supabase_url IS NULL OR supabase_url = '' THEN
    -- Try to get project ref and construct URL
    SELECT value INTO supabase_url FROM app_config WHERE key = 'project_ref';
    IF supabase_url IS NOT NULL AND supabase_url != '' THEN
      supabase_url := 'https://' || supabase_url || '.supabase.co';
    END IF;
  END IF;

  -- Construct Edge Function URL
  IF supabase_url IS NOT NULL AND supabase_url != '' AND position('.supabase.co' in supabase_url) > 0 THEN
    edge_function_url := replace(supabase_url, '.supabase.co', '.functions.supabase.co') || '/functions/v1/send-email-notification';
  ELSE
    error_msg := 'Supabase URL not configured in app_config table. Please run migration 054.';
    RAISE WARNING 'Email trigger: %', error_msg;
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Get service role key from config table
  SELECT value INTO service_role_key FROM app_config WHERE key = 'supabase_service_key';
  
  IF service_role_key IS NULL OR service_role_key = '' THEN
    error_msg := 'Supabase service role key not configured in app_config table. Please run migration 054.';
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;
CREATE TRIGGER trigger_send_email_notification
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION send_email_notification();

COMMIT;

-- Verify the config table has the values
DO $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
  config_count INT;
BEGIN
  SELECT COUNT(*) INTO config_count FROM app_config;
  RAISE NOTICE 'Config table has % rows', config_count;
  
  SELECT value INTO supabase_url FROM app_config WHERE key = 'supabase_url';
  SELECT value INTO service_key FROM app_config WHERE key = 'supabase_service_key';
  
  IF supabase_url IS NULL OR supabase_url = '' THEN
    RAISE WARNING '⚠️  Supabase URL not found in app_config!';
    RAISE NOTICE 'Run this to fix: INSERT INTO app_config (key, value) VALUES (''supabase_url'', ''https://YOUR_PROJECT_REF.supabase.co'') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;';
  ELSE
    RAISE NOTICE '✅ Supabase URL found: %', supabase_url;
  END IF;
  
  IF service_key IS NULL OR service_key = '' THEN
    RAISE WARNING '⚠️  Service role key not found in app_config!';
    RAISE NOTICE 'Run this to fix: INSERT INTO app_config (key, value) VALUES (''supabase_service_key'', ''YOUR_SERVICE_ROLE_KEY'') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;';
  ELSE
    RAISE NOTICE '✅ Service role key found (length: %)', length(service_key);
  END IF;
END $$;

