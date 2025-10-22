-- =============================================
-- DIAGNOSTIC QUERY: User Creation Issue
-- =============================================
-- Run this in Supabase SQL Editor to diagnose why new users cannot sign up
-- This will check RLS policies, permissions, triggers, and constraints

-- =============================================
-- 1. CHECK CURRENT RLS POLICIES ON USERS TABLE
-- =============================================
SELECT 
    '=== CURRENT RLS POLICIES ON USERS TABLE ===' as section,
    '' as separator;

SELECT 
    policyname as policy_name,
    cmd as command,
    roles as applies_to_roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- =============================================
-- 2. CHECK IF TRIGGER EXISTS AND IS ENABLED
-- =============================================
SELECT 
    '' as separator,
    '=== TRIGGER STATUS ===' as section;

SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'sync_auth_user_to_public';

-- =============================================
-- 3. CHECK TRIGGER FUNCTION DEFINITION
-- =============================================
SELECT 
    '' as separator,
    '=== TRIGGER FUNCTION DETAILS ===' as section;

SELECT 
    proname as function_name,
    prosecdef as security_definer,
    proowner::regrole as owner,
    proacl as acl_permissions
FROM pg_proc
WHERE proname = 'sync_auth_user_to_public';

-- =============================================
-- 4. CHECK TABLE CONSTRAINTS
-- =============================================
SELECT 
    '' as separator,
    '=== TABLE CONSTRAINTS ===' as section;

SELECT 
    conname as constraint_name,
    contype as constraint_type,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        ELSE contype::text
    END as type_description,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
ORDER BY contype, conname;

-- =============================================
-- 5. CHECK GRANTS ON USERS TABLE
-- =============================================
SELECT 
    '' as separator,
    '=== TABLE PERMISSIONS ===' as section;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY grantee, privilege_type;

-- =============================================
-- 6. CHECK GRANTS ON TRIGGER FUNCTION
-- =============================================
SELECT 
    '' as separator,
    '=== FUNCTION PERMISSIONS ===' as section;

SELECT 
    routine_schema,
    routine_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges
WHERE routine_name = 'sync_auth_user_to_public'
ORDER BY grantee, privilege_type;

-- =============================================
-- 7. TEST IF SERVICE ROLE CAN INSERT
-- =============================================
SELECT 
    '' as separator,
    '=== TESTING PERMISSIONS ===' as section;

-- This will show if RLS is blocking inserts
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'users'
              AND cmd = 'INSERT'
              AND (roles @> ARRAY['service_role'] OR roles @> ARRAY['postgres'])
        ) 
        THEN '✅ INSERT policy exists for service_role/postgres'
        ELSE '❌ NO INSERT policy for service_role/postgres - THIS IS THE PROBLEM!'
    END as diagnosis;

-- =============================================
-- 8. CHECK IF USERNAME HAS UNIQUE CONSTRAINT
-- =============================================
SELECT 
    '' as separator,
    '=== USERNAME CONSTRAINT CHECK ===' as section;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conrelid = 'public.users'::regclass
              AND conname = 'users_username_key'
        )
        THEN '✅ Username has unique constraint'
        ELSE '⚠️ Username does NOT have unique constraint - could cause duplicates!'
    END as username_constraint_status;

-- =============================================
-- 9. CHECK FOR RECENT AUTH ERRORS
-- =============================================
SELECT 
    '' as separator,
    '=== RECOMMENDED ACTIONS ===' as section;

SELECT 
    'If diagnosis shows "NO INSERT policy for service_role/postgres",' as action,
    'run migration 028_fix_user_creation_rls.sql immediately' as solution
UNION ALL
SELECT 
    'Check Supabase > Logs > Postgres Logs for detailed error messages' as action,
    'Look for RAISE NOTICE or RAISE WARNING messages' as solution
UNION ALL
SELECT 
    'After applying fix, test with a new Google OAuth signup' as action,
    'Monitor the logs to see the trigger succeed' as solution;

-- =============================================
-- 10. SUMMARY
-- =============================================
SELECT 
    '' as separator,
    '=== SUMMARY ===' as section,
    '' as next_steps;

SELECT 
    '📋 DIAGNOSIS COMPLETE' as message,
    'Review the output above to identify the issue' as instruction,
    'Most likely cause: Missing RLS policy for service_role to insert users' as probable_cause;

