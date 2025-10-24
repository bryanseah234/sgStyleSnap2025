-- Migration 037: Diagnose User Creation Issue
-- This migration diagnoses why new users cannot be created
-- despite the RLS fix being applied

BEGIN;

-- ============================================
-- 1. CHECK CURRENT RLS POLICIES ON USERS TABLE
-- ============================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  🔍 DIAGNOSING USER CREATION ISSUE                        ║
╚════════════════════════════════════════════════════════════╝

📋 Current RLS Policies on users table:
' as diagnostic_header;

-- Show all current RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    '📋 Policy Details' as info
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================
-- 2. CHECK TABLE PERMISSIONS
-- ============================================

SELECT '
📋 Table Permissions for users table:
' as permissions_header;

-- Check table permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable,
    '🔑 Permission' as info
FROM information_schema.table_privileges
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- ============================================
-- 3. CHECK FUNCTION PERMISSIONS
-- ============================================

SELECT '
📋 Function Permissions for sync_auth_user_to_public:
' as function_permissions_header;

-- Check function permissions
SELECT 
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    CASE 
        WHEN has_function_privilege('service_role', p.oid, 'EXECUTE') THEN '✅ service_role'
        ELSE '❌ service_role'
    END as service_role_execute,
    CASE 
        WHEN has_function_privilege('postgres', p.oid, 'EXECUTE') THEN '✅ postgres'
        ELSE '❌ postgres'
    END as postgres_execute,
    '🔧 Function Permissions' as info
FROM pg_proc p
WHERE p.proname = 'sync_auth_user_to_public';

-- ============================================
-- 4. CHECK TRIGGER STATUS
-- ============================================

SELECT '
📋 Trigger Status:
' as trigger_header;

-- Check if trigger exists and is enabled
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgtype & 2 = 2 THEN 'BEFORE'
        ELSE 'AFTER'
    END as timing,
    CASE 
        WHEN tgtype & 4 = 4 THEN 'INSERT'
        WHEN tgtype & 8 = 8 THEN 'DELETE'
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'OTHER'
    END as event,
    CASE 
        WHEN tgenabled = 'O' THEN '✅ ENABLED'
        WHEN tgenabled = 'D' THEN '❌ DISABLED'
        WHEN tgenabled = 'R' THEN '⚠️ REPLICA'
        WHEN tgenabled = 'A' THEN '⚠️ ALWAYS'
        ELSE '❓ UNKNOWN'
    END as status,
    '🔔 Trigger Status' as info
FROM pg_trigger t
WHERE tgname = 'sync_auth_user_to_public';

-- ============================================
-- 5. TEST INSERT PERMISSION AS SERVICE_ROLE
-- ============================================

SELECT '
📋 Testing INSERT permission simulation:
' as test_header;

-- Check if service_role can insert (simulation)
SELECT 
    CASE 
        WHEN has_table_privilege('service_role', 'public.users', 'INSERT') THEN '✅ service_role can INSERT'
        ELSE '❌ service_role CANNOT INSERT'
    END as service_role_insert,
    CASE 
        WHEN has_table_privilege('postgres', 'public.users', 'INSERT') THEN '✅ postgres can INSERT'
        ELSE '❌ postgres CANNOT INSERT'
    END as postgres_insert,
    '🧪 Permission Test' as info;

-- ============================================
-- 6. CHECK FOR CONFLICTING POLICIES
-- ============================================

SELECT '
📋 Checking for conflicting policies:
' as conflict_header;

-- Look for any restrictive policies that might conflict
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'INSERT' AND permissive = false THEN '⚠️ RESTRICTIVE INSERT POLICY'
        WHEN cmd = 'INSERT' AND permissive = true THEN '✅ PERMISSIVE INSERT POLICY'
        ELSE 'ℹ️ Other policy'
    END as policy_type,
    '🔍 Policy Analysis' as info
FROM pg_policies
WHERE tablename = 'users' 
  AND cmd = 'INSERT';

-- ============================================
-- 7. RECOMMENDATIONS
-- ============================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  💡 RECOMMENDATIONS                                        ║
╚════════════════════════════════════════════════════════════╝

🔧 If you see issues above:

1. ❌ If service_role CANNOT INSERT:
   → Run: GRANT INSERT ON public.users TO service_role;

2. ❌ If postgres CANNOT INSERT:
   → Run: GRANT INSERT ON public.users TO postgres;

3. ❌ If trigger is DISABLED:
   → Run: ALTER TABLE auth.users ENABLE TRIGGER sync_auth_user_to_public;

4. ❌ If function permissions missing:
   → Run: GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;

5. ⚠️ If RESTRICTIVE INSERT POLICY exists:
   → Run: DROP POLICY "policy_name" ON users;

6. ✅ If everything looks good but still failing:
   → Check Supabase Postgres Logs for detailed error messages
   → Look for RLS policy violations in the logs

🧪 Next Steps:
  1. Review the diagnostic results above
  2. Apply the recommended fixes
  3. Test user creation again
  4. Check Supabase → Logs → Postgres Logs for detailed errors

' as recommendations;

COMMIT;
