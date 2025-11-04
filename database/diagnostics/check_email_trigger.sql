-- Diagnostic script to check email notification trigger setup
-- Run this in Supabase SQL Editor to diagnose why emails aren't being sent

-- 1. Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_send_email_notification';

-- 2. Check if pg_net extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- 3. Check current database settings
SELECT 
  name, 
  setting, 
  source
FROM pg_settings 
WHERE name LIKE '%supabase%' OR name LIKE '%app%';

-- 4. Check if the function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'send_email_notification';

-- 5. Test the function's URL construction (dry run)
DO $$
DECLARE
  supabase_url TEXT;
  edge_function_url TEXT;
BEGIN
  -- Get Supabase URL
  supabase_url := current_setting('app.settings.supabase_url', TRUE);
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := coalesce(
      current_setting('app.supabase_url', TRUE),
      ''
    );
  END IF;
  
  -- Construct Edge Function URL
  IF supabase_url != '' AND position('.supabase.co' in supabase_url) > 0 THEN
    edge_function_url := replace(supabase_url, '.supabase.co', '.functions.supabase.co') || '/functions/v1/send-email-notification';
  ELSE
    edge_function_url := 'https://YOUR_PROJECT_REF.functions.supabase.co/functions/v1/send-email-notification';
  END IF;
  
  RAISE NOTICE 'Supabase URL: %', supabase_url;
  RAISE NOTICE 'Edge Function URL: %', edge_function_url;
END $$;

-- 6. Check recent notifications that should have triggered emails
SELECT 
  id,
  type,
  recipient_id,
  actor_id,
  created_at,
  email_status,
  email_sent_at,
  email_error
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check for any pg_net request logs (if available)
-- Note: This table may not exist in all pg_net versions or may have different column names
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'net' 
    AND table_name = 'http_request_queue'
  ) THEN
    RAISE NOTICE 'pg_net http_request_queue table exists';
    -- Check what columns exist
    PERFORM column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'net' 
    AND table_name = 'http_request_queue'
    LIMIT 1;
  ELSE
    RAISE NOTICE 'pg_net http_request_queue table does not exist (this is normal for some pg_net versions)';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Cannot query pg_net tables - %', SQLERRM;
END $$;

