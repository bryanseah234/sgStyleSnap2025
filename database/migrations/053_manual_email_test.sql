-- Migration 053: Manual Email Test & Configuration Helper
-- This helps you manually test and configure email notifications
-- Date: January 2025

BEGIN;

-- First, let's check if we can manually call the Edge Function
-- Replace YOUR_PROJECT_REF with your actual Supabase project reference
-- Replace YOUR_SERVICE_ROLE_KEY with your actual service role key

DO $$
DECLARE
  test_notification_id UUID;
  edge_function_url TEXT;
  service_role_key TEXT;
  payload JSONB;
  request_id BIGINT;
BEGIN
  -- Get a recent notification to test with
  SELECT id INTO test_notification_id 
  FROM notifications 
  WHERE email_status IS NULL 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF test_notification_id IS NULL THEN
    RAISE NOTICE 'No notifications found to test';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Testing with notification ID: %', test_notification_id;
  
  -- Set your Supabase project URL here
  -- Replace YOUR_PROJECT_REF with your actual project reference
  edge_function_url := 'https://YOUR_PROJECT_REF.functions.supabase.co/functions/v1/send-email-notification';
  
  -- Set your service role key here
  -- Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
  service_role_key := 'YOUR_SERVICE_ROLE_KEY';
  
  -- Build payload
  SELECT jsonb_build_object(
    'id', id,
    'recipient_id', recipient_id,
    'actor_id', actor_id,
    'type', type,
    'reference_id', reference_id,
    'message', custom_message,
    'created_at', created_at
  ) INTO payload
  FROM notifications
  WHERE id = test_notification_id;
  
  RAISE NOTICE 'Payload: %', payload;
  RAISE NOTICE 'Edge Function URL: %', edge_function_url;
  
  -- Try to call the Edge Function
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
    
    RAISE NOTICE '✅ Successfully queued HTTP request. Request ID: %', request_id;
    RAISE NOTICE 'Check Edge Function logs in Supabase Dashboard to see if it was called';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ Failed to call Edge Function: %', SQLERRM;
    RAISE WARNING 'Make sure:';
    RAISE WARNING '  1. pg_net extension is enabled';
    RAISE WARNING '  2. Edge Function URL is correct (replace YOUR_PROJECT_REF)';
    RAISE WARNING '  3. Service role key is correct (replace YOUR_SERVICE_ROLE_KEY)';
  END;
END $$;

COMMIT;

