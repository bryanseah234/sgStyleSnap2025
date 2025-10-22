-- Diagnostic queries to identify the user creation issue
-- Run these in Supabase SQL Editor to see what's wrong

-- 1. Check if sync function exists
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname LIKE '%sync_auth%';

-- 2. Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- 3. Check table permissions
SELECT 
    grantee, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'users' 
  AND table_schema = 'public';

-- 4. Check triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 5. Check constraints on users table
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    col.attname AS column_name
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_attribute col ON col.attrelid = con.conrelid
WHERE rel.relname = 'users'
  AND rel.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY con.conname;

-- 6. Test if we can insert a user manually (as service_role)
-- This will tell us if the issue is RLS or something else
-- DO NOT RUN THIS - Just for reference
-- INSERT INTO public.users (id, email, username, name)
-- VALUES (gen_random_uuid(), 'test@test.com', 'testuser', 'Test User');

