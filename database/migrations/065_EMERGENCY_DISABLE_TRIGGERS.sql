-- EMERGENCY FIX: Disable Triggers Blocking Auth User Creation
-- Run this immediately to fix the "Database error saving new user" issue
-- This disables ALL triggers on auth.users that are blocking authentication

BEGIN;

-- ============================================
-- STEP 1: SEE WHAT TRIGGERS EXIST
-- ============================================
SELECT 
    '========== CURRENT TRIGGERS ==========' as info,
    tgname as trigger_name,
    CASE WHEN tgenabled = 'O' THEN '✅ Enabled (BLOCKING!)' 
         WHEN tgenabled = 'D' THEN '✅ Disabled' 
         ELSE '⚠️ Unknown' END as status,
    proname as function_name,
    CASE WHEN proname IS NULL THEN '⚠️ FUNCTION MISSING!' ELSE '✅ Function exists' END as function_status
FROM pg_trigger t
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
AND tgisinternal = false;

-- ============================================
-- STEP 2: DISABLE ALL TRIGGERS
-- ============================================

-- Disable all user-defined triggers on auth.users
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- ============================================
-- STEP 3: VERIFY THEY ARE DISABLED
-- ============================================
SELECT 
    '========== TRIGGER STATUS AFTER DISABLE ==========' as info,
    tgname as trigger_name,
    CASE WHEN tgenabled = 'O' THEN '❌ Still Enabled (may need superuser)' 
         WHEN tgenabled = 'D' THEN '✅ Disabled Successfully' 
         ELSE '⚠️ Unknown Status' END as status
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
AND tgisinternal = false;

-- ============================================
-- STEP 4: ENSURE RLS POLICIES FOR EDGE FUNCTION
-- ============================================

-- Fix RLS policies so Edge Function can insert users
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

GRANT INSERT ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO postgres;

COMMIT;

-- ============================================
-- WHAT TO DO NEXT
-- ============================================
-- 
-- 1. ✅ Triggers should now be disabled
-- 2. ✅ Users should be able to sign up (auth.users will work)
-- 3. ⚠️ Configure Database Webhook to sync users to public.users:
--    - Go to Dashboard → Database → Webhooks
--    - Create webhook on auth.users INSERT
--    - URL: https://YOUR-PROJECT.supabase.co/functions/v1/sync-auth-users-realtime
-- 4. ✅ Test by signing up a new user
--
-- If you get "permission denied" when running ALTER TABLE:
-- - You may need superuser privileges
-- - Contact Supabase support to disable triggers
-- - Or ask them to remove triggers on auth.users

