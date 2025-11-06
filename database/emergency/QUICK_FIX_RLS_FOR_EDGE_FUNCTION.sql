-- Quick Fix: Enable Edge Function to Insert Users (No Triggers)
-- Run this if you're using webhooks + Edge Function and getting "Database error saving new user"
-- This does NOT create triggers on auth.users (which requires superuser)

BEGIN;

-- 1. Ensure RLS policy allows service_role to insert users
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- 2. Grant permissions
GRANT INSERT ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO postgres;

COMMIT;

-- Verify it worked
SELECT 
    policyname,
    cmd,
    roles,
    '✅ Policy exists' as status
FROM pg_policies
WHERE tablename = 'users' 
  AND policyname = 'Service role can insert users';

