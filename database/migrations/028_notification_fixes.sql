-- ============================================
-- Migration 028: Notification Fixes
-- ============================================
-- Purpose: Comprehensive fixes for notifications table RLS policies and trigger functions
-- Dependencies: 009_notifications_system.sql, 027_friend_notifications.sql
-- Creates:
--   - create_friend_request_notification() function
--   - create_friend_request_accepted_notification() function
--   - create_friend_suggestion_notification() function
--   - create_outfit_like_notification() function
--   - create_item_like_notification() function
--   - set_notification_expiry() function
-- Modifies:
--   - notifications table (RLS policies)
--   - Trigger functions (updated to SECURITY DEFINER)
-- 
-- IMPORTANT: Run migrations in sequential order!
-- NOTE: Also fixes user creation RLS (misnumbered file - should be with user sync)
-- ============================================

-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- STEP 1: FIX USER CREATION RLS (MISNUMBERED FILE)
-- ============================================
-- This was numbered 028 but relates to users, not notifications
-- Included here as per consolidation plan

-- Drop old restrictive insert policy
DROP POLICY IF EXISTS "Admin can insert users" ON users;

-- Create new insert policy for service role
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO service_role;
GRANT SELECT ON public.users TO postgres;

-- Add unique constraint on username if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
        RAISE NOTICE '✅ Added unique constraint on username';
    END IF;
END $$;

-- ============================================
-- STEP 2: FIX NOTIFICATIONS RLS POLICIES
-- ============================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- Policy 2: Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Policy 3: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- Policy 4: System can insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- STEP 3: CREATE/UPDATE NOTIFICATION TRIGGER FUNCTIONS
-- ============================================

-- Friend request notification function
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification when status is 'pending' (new request)
  IF NEW.status = 'pending' THEN
    -- Create notification for the receiver
    INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
    VALUES (NEW.receiver_id, NEW.requester_id, 'friend_request', NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Friend request accepted notification function
CREATE OR REPLACE FUNCTION create_friend_request_accepted_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification when status changes from 'pending' to 'accepted'
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Notify the original requester that their request was accepted
    INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
    VALUES (NEW.requester_id, NEW.receiver_id, 'friend_request_accepted', NEW.id)
    ON CONFLICT DO NOTHING;
    
    -- Mark the original friend request notification as read
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE reference_id = NEW.id
      AND type = 'friend_request'
      AND recipient_id = NEW.receiver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Friend suggestion notification function
CREATE OR REPLACE FUNCTION create_friend_suggestion_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
  VALUES (NEW.owner_id, NEW.suggester_id, 'friend_outfit_suggestion', NEW.id)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Outfit like notification function
CREATE OR REPLACE FUNCTION create_outfit_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  outfit_owner_id UUID;
  are_friends BOOLEAN;
BEGIN
  -- Get outfit owner
  SELECT user_id INTO outfit_owner_id
  FROM shared_outfits
  WHERE id = NEW.outfit_id;
  
  -- Check if they are friends
  SELECT EXISTS(
    SELECT 1 FROM friends
    WHERE status = 'accepted'
      AND (
        (requester_id = NEW.user_id AND receiver_id = outfit_owner_id) OR
        (requester_id = outfit_owner_id AND receiver_id = NEW.user_id)
      )
  ) INTO are_friends;
  
  -- Only create notification if:
  -- 1. Liker is not the owner
  -- 2. They are friends
  IF outfit_owner_id != NEW.user_id AND are_friends THEN
    -- Check if notification already exists (prevent duplicates)
    IF NOT EXISTS(
      SELECT 1 FROM notifications
      WHERE recipient_id = outfit_owner_id
        AND actor_id = NEW.user_id
        AND type = 'outfit_like'
        AND reference_id = NEW.outfit_id
    ) THEN
      INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
      VALUES (outfit_owner_id, NEW.user_id, 'outfit_like', NEW.outfit_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Item like notification function
CREATE OR REPLACE FUNCTION create_item_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  item_owner_id UUID;
  are_friends BOOLEAN;
BEGIN
  -- Get item owner
  SELECT owner_id INTO item_owner_id
  FROM clothes
  WHERE id = NEW.item_id;
  
  -- Check if they are friends
  SELECT EXISTS(
    SELECT 1 FROM friends
    WHERE status = 'accepted'
      AND (
        (requester_id = NEW.user_id AND receiver_id = item_owner_id) OR
        (requester_id = item_owner_id AND receiver_id = NEW.user_id)
      )
  ) INTO are_friends;
  
  -- Only create notification if:
  -- 1. Liker is not the owner
  -- 2. They are friends
  IF item_owner_id != NEW.user_id AND are_friends THEN
    -- Check if notification already exists (prevent duplicates)
    IF NOT EXISTS(
      SELECT 1 FROM notifications
      WHERE recipient_id = item_owner_id
        AND actor_id = NEW.user_id
        AND type = 'item_like'
        AND reference_id = NEW.item_id
    ) THEN
      INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
      VALUES (item_owner_id, NEW.user_id, 'item_like', NEW.item_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notification expiry function
CREATE OR REPLACE FUNCTION set_notification_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Set expiry to 7 days from creation
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at = NOW() + INTERVAL '7 days';
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;

-- Grant execute permissions on notification functions
GRANT EXECUTE ON FUNCTION create_friend_request_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION create_friend_request_accepted_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION create_friend_suggestion_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION create_outfit_like_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION create_item_like_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION set_notification_expiry() TO authenticated;

-- ============================================
-- STEP 5: VERIFICATION
-- ============================================

-- Verify notification policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'notifications';
  
  IF policy_count >= 4 THEN
    RAISE NOTICE '✅ All notification policies created successfully (%)', policy_count;
  ELSE
    RAISE WARNING '⚠️ Expected at least 4 policies, found %', policy_count;
  END IF;
END $$;

-- Verify user insert policy exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' 
    AND policyname = 'Service role can insert users'
  ) THEN
    RAISE NOTICE '✅ Service role insert policy exists on users table';
  ELSE
    RAISE WARNING '⚠️ Service role insert policy not found on users table';
  END IF;
END $$;

COMMIT;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Users can view their own notifications" ON notifications IS 'Users can only view notifications sent to them';
COMMENT ON POLICY "Users can update their own notifications" ON notifications IS 'Users can only update notifications sent to them (e.g., mark as read)';
COMMENT ON POLICY "Users can delete their own notifications" ON notifications IS 'Users can only delete notifications sent to them';
COMMENT ON POLICY "System can insert notifications" ON notifications IS 'Allows system triggers to insert notifications. Required for friend request notifications to work.';
COMMENT ON POLICY "Service role can insert users" ON users IS 'Allows trigger functions to insert new users. Required for user sync.';

COMMENT ON FUNCTION create_friend_request_notification IS 'Creates notification when friend request is sent';
COMMENT ON FUNCTION create_friend_request_accepted_notification IS 'Creates notification when friend request is accepted';
COMMENT ON FUNCTION create_friend_suggestion_notification IS 'Creates notification when friend suggests an outfit';
COMMENT ON FUNCTION create_outfit_like_notification IS 'Creates notification when friend likes an outfit';
COMMENT ON FUNCTION create_item_like_notification IS 'Creates notification when friend likes an item';
COMMENT ON FUNCTION set_notification_expiry IS 'Sets notification expiry to 7 days from creation';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this migration, verify with:
-- 1. Check policies exist:
--    SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('notifications', 'users') ORDER BY tablename, policyname;
-- 
-- 2. Check functions exist:
--    SELECT proname FROM pg_proc WHERE proname LIKE 'create_%_notification' ORDER BY proname;
-- 
-- 3. Test friend request notification (should create notification):
--    INSERT INTO friends (requester_id, receiver_id, status) VALUES ('user1-uuid', 'user2-uuid', 'pending');

