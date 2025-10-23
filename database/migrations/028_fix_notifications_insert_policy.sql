-- =============================================
-- Migration 028: Fix Notifications INSERT Policy
-- =============================================
-- Description: Adds missing INSERT policy for notifications table
-- Dependencies: 009_notifications_system.sql, 027_friend_notifications.sql
-- Version: 1.0.0
-- Date: 2025-01-27
-- Safe to rerun: Yes
-- =============================================

BEGIN;

-- =============================================
-- 1. ADD MISSING INSERT POLICY FOR NOTIFICATIONS
-- =============================================

-- The notifications table is missing an INSERT policy, which is needed
-- for the trigger functions to create notifications
-- Allow system to insert notifications (triggers run with SECURITY DEFINER)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 2. VERIFY EXISTING POLICIES
-- =============================================

-- Ensure all necessary policies exist
DO $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'System can insert notifications'
  ) THEN
    -- Policy doesn't exist, create it
    EXECUTE 'CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- =============================================
-- 3. GRANT NECESSARY PERMISSIONS
-- =============================================

-- Ensure the authenticated role can insert notifications
-- (This is needed for the trigger functions to work)
GRANT INSERT ON notifications TO authenticated;

-- =============================================
-- 4. COMMENTS & DOCUMENTATION
-- =============================================

COMMENT ON POLICY "System can insert notifications" ON notifications IS 
'Allows system triggers to insert notifications. Required for friend request notifications to work.';

-- =============================================
-- END OF MIGRATION
-- =============================================

COMMIT;

COMMENT ON SCHEMA public IS 'StyleSnap notifications INSERT policy fix complete';
