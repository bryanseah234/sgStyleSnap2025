-- Diagnostic: Check for Triggers/Hooks Blocking Auth User Creation
-- Run this to see what's preventing users from being created in auth.users

-- ============================================
-- 1. CHECK FOR TRIGGERS ON auth.users
-- ============================================
SELECT 
    '========== TRIGGERS ON auth.users ==========' as section,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE WHEN tgenabled = 'O' THEN '✅ Enabled' ELSE '❌ Disabled' END as status,
    tgtype::text as trigger_type,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
ORDER BY tgname;

-- ============================================
-- 2. CHECK TRIGGER FUNCTIONS
-- ============================================
SELECT 
    '========== TRIGGER FUNCTIONS ==========' as section,
    proname as function_name,
    CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ No SECURITY DEFINER' END as security_type,
    pg_get_functiondef(oid) LIKE '%RAISE EXCEPTION%' as has_exception,
    pg_get_functiondef(oid) LIKE '%sync_auth_user_to_public%' as is_sync_function
FROM pg_proc 
WHERE proname LIKE '%sync%' OR proname LIKE '%auth%user%'
ORDER BY proname;

-- ============================================
-- 3. CHECK FOR DATABASE WEBHOOKS
-- ============================================
SELECT 
    '========== DATABASE WEBHOOKS ==========' as section,
    event_object_schema as schema_name,
    event_object_table as table_name,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- ============================================
-- 4. CHECK RECENT AUTH FAILURES
-- ============================================
SELECT 
    '========== RECENT AUTH USERS ==========' as section,
    COUNT(*) as total_auth_users,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as users_last_hour,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as users_last_day
FROM auth.users;

-- ============================================
-- 5. RECOMMENDATIONS
-- ============================================
SELECT 
    '========== RECOMMENDATIONS ==========' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass AND tgenabled = 'O')
        THEN '⚠️ Found enabled triggers on auth.users - these might be blocking auth'
        ELSE '✅ No enabled triggers found'
    END as trigger_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname LIKE '%sync_auth_user_to_public%')
        THEN '⚠️ Found sync_auth_user_to_public function - check if trigger is enabled'
        ELSE '✅ No sync function found'
    END as function_status;

