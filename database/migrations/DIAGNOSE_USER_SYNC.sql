-- Diagnostic Script: Check User Sync Configuration
-- Run this in Supabase SQL Editor to diagnose user creation issues
-- 
-- This script checks:
-- 1. Trigger existence and configuration
-- 2. Function existence and permissions
-- 3. RLS policies for user inserts
-- 4. App config for Supabase URL
-- 5. Recent errors in logs

-- ============================================
-- 1. CHECK TRIGGER
-- ============================================
SELECT 
    '========== TRIGGER CHECK ==========' as section,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE WHEN tgenabled = 'O' THEN '✅ Enabled' ELSE '❌ Disabled' END as status
FROM pg_trigger 
WHERE tgname = 'sync_auth_user_to_public' 
  AND tgrelid = 'auth.users'::regclass;

-- ============================================
-- 2. CHECK FUNCTION
-- ============================================
SELECT 
    '========== FUNCTION CHECK ==========' as section,
    proname as function_name,
    CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ No SECURITY DEFINER' END as security_type,
    pg_get_functiondef(oid) LIKE '%generate_unique_username_for_sync%' as has_username_function
FROM pg_proc 
WHERE proname = 'sync_auth_user_to_public';

-- ============================================
-- 3. CHECK RLS POLICIES
-- ============================================
SELECT 
    '========== RLS POLICY CHECK ==========' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE WHEN cmd = 'INSERT' THEN '✅ INSERT policy exists' ELSE '❌ No INSERT policy' END as status
FROM pg_policies
WHERE tablename = 'users' 
  AND schemaname = 'public'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- ============================================
-- 4. CHECK APP CONFIG
-- ============================================
SELECT 
    '========== APP CONFIG CHECK ==========' as section,
    key,
    CASE 
        WHEN key = 'supabase_url' AND value IS NOT NULL AND value != '' 
        THEN '✅ Supabase URL configured' 
        ELSE '⚠️ Supabase URL not configured' 
    END as status,
    value
FROM app_config
WHERE key = 'supabase_url';

-- ============================================
-- 5. CHECK TABLE PERMISSIONS
-- ============================================
SELECT 
    '========== TABLE PERMISSIONS CHECK ==========' as section,
    grantee,
    privilege_type,
    '✅ Permission granted' as status
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND grantee IN ('service_role', 'postgres')
  AND privilege_type = 'INSERT';

-- ============================================
-- 6. CHECK FUNCTION PERMISSIONS
-- ============================================
SELECT 
    '========== FUNCTION PERMISSIONS CHECK ==========' as section,
    grantee,
    routine_name,
    '✅ Permission granted' as status
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN ('sync_auth_user_to_public', 'generate_unique_username_for_sync')
  AND grantee IN ('service_role', 'postgres');

-- ============================================
-- 7. CHECK RECENT AUTH USERS WITHOUT PROFILES
-- ============================================
SELECT 
    '========== MISSING PROFILES CHECK ==========' as section,
    COUNT(*) as missing_profiles_count,
    CASE 
        WHEN COUNT(*) > 0 
        THEN '⚠️ Found auth users without profiles' 
        ELSE '✅ All auth users have profiles' 
    END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
  AND au.created_at > NOW() - INTERVAL '24 hours';

-- ============================================
-- 8. SUMMARY AND RECOMMENDATIONS
-- ============================================
SELECT 
    '========== RECOMMENDATIONS ==========' as section,
    'If trigger is missing:' as issue,
    'Run: database/migrations/062_fix_user_sync_with_robust_fallback.sql' as solution
UNION ALL
SELECT 
    '',
    'If Supabase URL not configured:',
    'Run: INSERT INTO app_config (key, value) VALUES (''supabase_url'', ''https://YOUR-PROJECT.supabase.co'') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;'
UNION ALL
SELECT 
    '',
    'If RLS policy missing:',
    'Run: CREATE POLICY "Service role can insert users" ON users FOR INSERT TO service_role, postgres WITH CHECK (true);'
UNION ALL
SELECT 
    '',
    'If Edge Function not deployed:',
    'The fallback direct insert will handle user creation automatically';

