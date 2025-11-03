-- Migration 051: Fix Email Notification Message Field
-- This fixes the bug in migration 050 where NEW.message was referenced
-- but the notifications table has custom_message, not message
-- Date: January 2025
--
-- Safe to rerun: Yes

BEGIN;

-- Fix the send_email_notification function to use custom_message instead of message
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
  -- FIX: Use custom_message instead of message
  payload := jsonb_build_object(
    'id', NEW.id,
    'recipient_id', NEW.recipient_id,
    'actor_id', NEW.actor_id,
    'type', NEW.type,
    'reference_id', NEW.reference_id,
    'message', NEW.custom_message,
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

COMMENT ON FUNCTION send_email_notification() IS 'Triggers email sending via Edge Function when notification is created (fixed to use custom_message field)';

COMMIT;

