-- Migration 045: Comprehensive Fix for Notifications RLS Policy
-- This migration fixes the RLS policy violation for the notifications table
-- by ensuring triggers can insert notifications and users can only access their own

BEGIN;

-- ============================================
-- 1. DROP EXISTING POLICIES TO START FRESH
-- ============================================

-- Drop all existing policies on notifications table
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- ============================================
-- 2. CREATE COMPREHENSIVE RLS POLICIES
-- ============================================

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
-- This allows trigger functions to insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 3. ENSURE TRIGGER FUNCTIONS HAVE PROPER SECURITY
-- ============================================

-- Update trigger functions to use SECURITY DEFINER
-- This ensures they run with the privileges of the function owner (postgres)
-- rather than the caller's privileges

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
  NEW.expires_at = NOW() + INTERVAL '7 days';
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. GRANT NECESSARY PERMISSIONS
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
-- 5. VERIFY POLICIES WERE CREATED
-- ============================================

-- Check that all policies were created successfully
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'notifications';
  
  IF policy_count = 4 THEN
    RAISE NOTICE 'SUCCESS: All 4 notification policies created successfully';
  ELSE
    RAISE WARNING 'WARNING: Expected 4 policies, found %', policy_count;
  END IF;
END $$;

-- ============================================
-- 6. COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON POLICY "Users can view their own notifications" ON notifications IS 
'Users can only view notifications sent to them';

COMMENT ON POLICY "Users can update their own notifications" ON notifications IS 
'Users can only update notifications sent to them (e.g., mark as read)';

COMMENT ON POLICY "Users can delete their own notifications" ON notifications IS 
'Users can only delete notifications sent to them';

COMMENT ON POLICY "System can insert notifications" ON notifications IS 
'Allows system triggers to insert notifications. Required for friend request notifications to work.';

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this migration, test with:
-- 1. Send a friend request (should create notification)
-- 2. Accept a friend request (should create notification)
-- 3. Check that users can only see their own notifications
-- 4. Verify triggers work without RLS violations
