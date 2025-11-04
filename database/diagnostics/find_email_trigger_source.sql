-- Quick check: Find the function that's causing the pg_net error
-- This will help identify if there's another trigger or function calling it

SELECT 
  t.trigger_name,
  t.event_object_table,
  t.event_manipulation,
  t.action_timing,
  p.proname as function_name,
  p.prosrc as function_source
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON p.proname = substring(t.action_statement from 'EXECUTE FUNCTION ([^(]+)')
WHERE t.event_object_table = 'notifications'
OR t.action_statement LIKE '%send_email%';

-- Also check if the function exists and what it does
SELECT 
  p.proname,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%email%notification%'
AND n.nspname = 'public';

