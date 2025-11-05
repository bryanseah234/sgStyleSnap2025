-- CRITICAL FIX: Disable Triggers Blocking Auth User Creation
-- Run this if users cannot be created in auth.users
-- This will disable ALL triggers on auth.users table

BEGIN;

-- ============================================
-- DISABLE ALL TRIGGERS ON auth.users
-- ============================================

-- Method 1: Disable all triggers at once (most reliable)
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- ============================================
-- VERIFY TRIGGERS ARE DISABLED
-- ============================================

SELECT 
    '========== TRIGGER STATUS ==========' as section,
    tgname as trigger_name,
    CASE WHEN tgenabled = 'O' THEN '❌ Still Enabled' 
         WHEN tgenabled = 'D' THEN '✅ Disabled' 
         ELSE '⚠️ Unknown Status' END as status
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
AND tgisinternal = false;

-- ============================================
-- ENSURE RLS POLICIES FOR EDGE FUNCTION
-- ============================================

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
-- NEXT STEPS
-- ============================================
-- 
-- 1. After running this, users should be able to sign up
-- 2. Configure Database Webhook to call Edge Function:
--    - Go to Dashboard → Database → Webhooks
--    - Create webhook on auth.users INSERT
--    - Point to: https://YOUR-PROJECT.supabase.co/functions/v1/sync-auth-users-realtime
-- 3. Test by signing up a new user

