-- Migration 052: Fix Email Notification Trigger with Better Logging
-- This adds verbose logging to help diagnose why emails aren't being sent
-- Date: January 2025
--
-- Safe to rerun: Yes

BEGIN;

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Replace the function with better error handling and logging
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
    RAISE LOG 'Email trigger: Skipping non-INSERT operation: %', TG_OP;
    RETURN NEW;
  END IF;

  RAISE LOG 'Email trigger: Processing notification ID: %, type: %, recipient: %', NEW.id, NEW.type, NEW.recipient_id;

  -- Get Supabase URL and construct Edge Function URL
  supabase_url := current_setting('app.settings.supabase_url', TRUE);
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := coalesce(
      current_setting('app.supabase_url', TRUE),
      ''
    );
  END IF;

  -- If still empty, try to get from Supabase project URL environment variable
  IF supabase_url = '' THEN
    -- Try to construct from known Supabase pattern
    -- This requires the project reference to be set
    supabase_url := current_setting('app.settings.project_ref', TRUE);
    IF supabase_url != '' THEN
      supabase_url := 'https://' || supabase_url || '.supabase.co';
    END IF;
  END IF;

  -- Construct Edge Function URL
  IF supabase_url != '' AND position('.supabase.co' in supabase_url) > 0 THEN
    edge_function_url := replace(supabase_url, '.supabase.co', '.functions.supabase.co') || '/functions/v1/send-email-notification';
    RAISE LOG 'Email trigger: Constructed Edge Function URL: %', edge_function_url;
  ELSE
    error_msg := 'Supabase URL not configured. Please set app.settings.supabase_url or app.settings.project_ref';
    RAISE WARNING 'Email trigger: %', error_msg;
    -- Update notification with error
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Get service role key for authentication
  service_role_key := current_setting('app.settings.supabase_service_key', TRUE);
  IF service_role_key IS NULL OR service_role_key = '' THEN
    error_msg := 'Supabase service role key not configured. Please set app.settings.supabase_service_key';
    RAISE WARNING 'Email trigger: %', error_msg;
    -- Update notification with error
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Build payload for Edge Function
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

  -- Call Edge Function using pg_net (Supabase's HTTP extension)
  BEGIN
    -- Make async HTTP POST request
    SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key,
        'apikey', service_role_key
      )::jsonb,
      body := payload::text
    ) INTO request_id;

    -- Log success (request is async, so we don't wait for response)
    RAISE LOG 'Email trigger: Request queued successfully. notification_id=%, request_id=%', NEW.id, request_id;
    
    -- Mark as queued
    UPDATE notifications 
    SET email_status = 'email_queued'
    WHERE id = NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- If pg_net is not available or fails, log detailed error
    error_msg := 'Failed to queue email notification: ' || SQLERRM;
    RAISE WARNING 'Email trigger: %', error_msg;
    RAISE WARNING 'Email trigger: Edge Function URL: %', edge_function_url;
    RAISE WARNING 'Email trigger: Error details: %', SQLSTATE;
    
    -- Update notification with error
    UPDATE notifications 
    SET email_status = 'email_error', 
        email_error = error_msg
    WHERE id = NEW.id;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION send_email_notification() IS 'Triggers email sending via Edge Function when notification is created (with enhanced logging)';

COMMIT;

