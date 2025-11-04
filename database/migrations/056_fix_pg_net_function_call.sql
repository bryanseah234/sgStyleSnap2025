-- Migration 056: Fix pg_net Function Call
-- This fixes the pg_net http_post function call to use the correct API
-- Date: January 2025

BEGIN;

-- First, ensure pg_net extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Check what pg_net functions are available
DO $$
DECLARE
  func_exists BOOLEAN;
  ext_version TEXT;
BEGIN
  -- Check if extension exists
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
  ) INTO func_exists;
  
  IF NOT func_exists THEN
    RAISE WARNING 'pg_net extension not found. Attempting to create...';
    CREATE EXTENSION IF NOT EXISTS pg_net;
  END IF;
  
  -- Get extension version
  SELECT extversion INTO ext_version 
  FROM pg_extension 
  WHERE extname = 'pg_net';
  
  RAISE NOTICE 'pg_net extension version: %', ext_version;
  
  -- Check if http_post function exists with different signatures
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'net' AND p.proname = 'http_post'
  ) THEN
    RAISE NOTICE 'net.http_post function exists';
  ELSE
    RAISE WARNING 'net.http_post function does not exist. Checking for alternatives...';
  END IF;
END $$;

-- Update the function to use the correct pg_net API
-- Try different approaches based on pg_net version
CREATE OR REPLACE FUNCTION send_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
  payload JSONB;
  request_id BIGINT;
  error_msg TEXT;
  func_result TEXT;
BEGIN
  -- Only send email for new notifications (not updates)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Get Supabase URL from config table
  SELECT value INTO supabase_url FROM app_config WHERE key = 'supabase_url';
  
  IF supabase_url IS NULL OR supabase_url = '' THEN
    SELECT value INTO supabase_url FROM app_config WHERE key = 'project_ref';
    IF supabase_url IS NOT NULL AND supabase_url != '' THEN
      supabase_url := 'https://' || supabase_url || '.supabase.co';
    END IF;
  END IF;

  -- Construct Edge Function URL
  IF supabase_url IS NOT NULL AND supabase_url != '' AND position('.supabase.co' in supabase_url) > 0 THEN
    edge_function_url := replace(supabase_url, '.supabase.co', '.functions.supabase.co') || '/functions/v1/send-email-notification';
  ELSE
    error_msg := 'Supabase URL not configured in app_config table.';
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
    error_msg := 'Supabase service role key not configured in app_config table.';
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

  -- Call Edge Function using pg_net
  -- Try different function signatures based on pg_net version
  BEGIN
    -- Method 1: Try with named parameters (newer pg_net)
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
      
      RAISE LOG 'Email trigger: HTTP request queued via net.http_post (method 1), request_id: %', request_id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Method 2: Try with positional parameters
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
        
        RAISE LOG 'Email trigger: HTTP request queued via net.http_post (method 2), request_id: %', request_id;
        
      EXCEPTION WHEN OTHERS THEN
        -- Method 3: Try http_post without schema prefix
        BEGIN
          SELECT http_post(
            edge_function_url,
            jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || service_role_key,
              'apikey', service_role_key
            )::jsonb,
            payload::text
          ) INTO request_id;
          
          RAISE LOG 'Email trigger: HTTP request queued via http_post (method 3), request_id: %', request_id;
          
        EXCEPTION WHEN OTHERS THEN
          -- If all methods fail, raise the error
          RAISE;
        END;
      END;
    END;

    -- Mark as queued
    UPDATE notifications 
    SET email_status = 'email_queued'
    WHERE id = NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- If pg_net is not available, log detailed error
    error_msg := 'Failed to queue email via pg_net: ' || SQLERRM || ' (SQLSTATE: ' || SQLSTATE || ')';
    RAISE WARNING 'Email trigger: %', error_msg;
    RAISE WARNING 'Email trigger: Edge Function URL: %', edge_function_url;
    RAISE WARNING 'Email trigger: pg_net extension may not be properly installed or enabled';
    
    -- Update notification with error
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

-- Verify pg_net extension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE NOTICE '✅ pg_net extension is enabled';
  ELSE
    RAISE WARNING '⚠️  pg_net extension is NOT enabled. You may need to enable it in Supabase Dashboard → Database → Extensions';
  END IF;
END $$;

