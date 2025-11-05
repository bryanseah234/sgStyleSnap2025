-- Migration 064: Disable ALL Triggers on auth.users (CRITICAL FIX)
-- This fixes the issue where users cannot be created in auth.users
-- 
-- Problem: Existing triggers on auth.users are failing and blocking auth inserts
-- Solution: Disable all triggers on auth.users and rely on webhooks only
--
-- IMPORTANT: This uses DISABLE instead of DROP because we might not have DROP privileges
-- If DISABLE doesn't work, you'll need to contact Supabase support or use superuser

BEGIN;

-- ============================================
-- 1. DISABLE ALL TRIGGERS ON auth.users
-- ============================================

-- First, let's see what triggers exist
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '========== CHECKING TRIGGERS ON auth.users ==========';
    
    FOR trigger_record IN 
        SELECT tgname, tgenabled
        FROM pg_trigger
        WHERE tgrelid = 'auth.users'::regclass
        AND tgisinternal = false  -- Only user-defined triggers
    LOOP
        RAISE NOTICE 'Found trigger: % (enabled: %)', trigger_record.tgname, trigger_record.tgenabled;
        
        -- Try to disable the trigger
        BEGIN
            EXECUTE format('ALTER TABLE auth.users DISABLE TRIGGER %I', trigger_record.tgname);
            RAISE NOTICE '✅ Disabled trigger: %', trigger_record.tgname;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '⚠️ Could not disable trigger %: %', trigger_record.tgname, SQLERRM;
            -- Try ALTER TABLE ... DISABLE TRIGGER ALL instead
            BEGIN
                EXECUTE 'ALTER TABLE auth.users DISABLE TRIGGER ALL';
                RAISE NOTICE '✅ Disabled all triggers on auth.users using DISABLE TRIGGER ALL';
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING '⚠️ Could not disable triggers: %. You may need superuser privileges.', SQLERRM;
            END;
        END;
    END LOOP;
END $$;

-- ============================================
-- 2. VERIFY TRIGGERS ARE DISABLED
-- ============================================

SELECT 
    '========== TRIGGER STATUS AFTER DISABLE ==========' as section,
    tgname as trigger_name,
    CASE WHEN tgenabled = 'O' THEN '❌ Still Enabled' 
         WHEN tgenabled = 'D' THEN '✅ Disabled' 
         ELSE '⚠️ Unknown Status' END as status
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
AND tgisinternal = false;

-- ============================================
-- 3. ENSURE RLS POLICIES ALLOW INSERTS (for Edge Function)
-- ============================================

DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- Grant permissions
GRANT INSERT ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO postgres;

COMMIT;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 
-- After running this migration:
-- 1. Users should be able to sign up (auth.users will work)
-- 2. Configure Database Webhook or Auth Webhook to call Edge Function
-- 3. Edge Function will sync users to public.users
--
-- If you get "permission denied" errors:
-- - You may need superuser privileges to disable triggers
-- - Contact Supabase support to disable triggers on auth.users
-- - Or ask them to remove the triggers entirely
--
-- Alternative: Use Supabase Dashboard → Database → Webhooks
-- Create a webhook that triggers on auth.users INSERT and calls your Edge Function

