-- Migration 041: Clean Up Old User Sync Triggers
-- This migration removes the old database triggers since we now use
-- the Edge Function sync-auth-users-realtime for user synchronization

BEGIN;

-- ============================================
-- 1. DROP OLD TRIGGERS
-- ============================================

-- Drop the old triggers that are now replaced by Edge Function
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
DROP TRIGGER IF EXISTS sync_google_profile_photo ON auth.users;

-- ============================================
-- 2. DROP OLD FUNCTIONS
-- ============================================

-- Drop the old trigger functions (keep helper functions for manual operations)
DROP FUNCTION IF EXISTS sync_auth_user_to_public();
DROP FUNCTION IF EXISTS sync_google_profile_photo();

-- Keep these functions as they're still useful for manual operations:
-- - update_user_google_profile(UUID)
-- - get_current_google_profile_data(UUID)
-- - get_current_google_profile_photo(UUID)
-- - sync_user_profile_photo(UUID)
-- - sync_all_user_profiles()

-- ============================================
-- 3. VERIFY CLEANUP
-- ============================================

-- Check that triggers were removed
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgname IS NULL THEN '✅ No triggers found'
        ELSE '⚠️ Trigger still exists: ' || tgname
    END as status
FROM pg_trigger t
WHERE tgname IN ('sync_auth_user_to_public', 'sync_google_profile_photo')
ORDER BY tgname;

-- Check that functions were removed
SELECT 
    p.proname as function_name,
    CASE 
        WHEN p.proname IS NULL THEN '✅ Function removed'
        ELSE '⚠️ Function still exists: ' || p.proname
    END as status
FROM pg_proc p
WHERE p.proname IN ('sync_auth_user_to_public', 'sync_google_profile_photo')
ORDER BY p.proname;

-- ============================================
-- 4. SUCCESS MESSAGE
-- ============================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✅ MIGRATION 041 COMPLETED SUCCESSFULLY!                  ║
╚════════════════════════════════════════════════════════════╝

📋 What was cleaned up:
  ✅ Removed sync_auth_user_to_public trigger
  ✅ Removed sync_google_profile_photo trigger
  ✅ Removed sync_auth_user_to_public function
  ✅ Removed sync_google_profile_photo function

🔍 What remains:
  ✅ Helper functions for manual profile sync operations
  ✅ RLS policies for users table
  ✅ Edge Function sync-auth-users-realtime (handles real-time sync)

🧪 Next steps:
  1. Test user creation with the new Edge Function
  2. Verify users are created in public.users table
  3. Check Supabase → Logs → Edge Functions for sync activity
  4. Monitor real-time user synchronization

🐛 If issues occur:
  - Check Edge Function logs in Supabase dashboard
  - Verify Edge Function is running and healthy
  - Test the health endpoint: GET /functions/v1/sync-auth-users-realtime

' as result;

COMMIT;

COMMENT ON SCHEMA public IS 'StyleSnap old user sync triggers cleaned up (migration 041) - now using Edge Function';
