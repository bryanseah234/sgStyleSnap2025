-- =============================================
-- Migration 027: Friend Request & Outfit Sharing Notifications
-- =============================================
-- Description: Adds notification support for friend requests and outfit sharing
-- Dependencies: 009_notifications_system.sql, 018_notification_cleanup_system.sql
-- Version: 1.0.0
-- Date: 2025-01-27
-- Safe to rerun: Yes
-- =============================================

BEGIN;

-- =============================================
-- 1. UPDATE NOTIFICATIONS TABLE TYPE CONSTRAINT
-- =============================================

-- Drop existing constraint and add new notification types
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check CHECK (
    type IN (
      'friend_outfit_suggestion',  -- Friend suggested an outfit using your items
      'outfit_like',                -- Friend liked your shared outfit
      'item_like',                  -- Friend liked your closet item
      'friend_request',             -- Someone sent you a friend request
      'friend_request_accepted',    -- Someone accepted your friend request
      'outfit_shared'               -- Someone shared an outfit with you
    )
  );

-- =============================================
-- 2. CREATE OUTFIT SHARES TABLE
-- =============================================
-- Table to track when users share outfits with specific friends

CREATE TABLE IF NOT EXISTS outfit_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- The outfit being shared
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  
  -- Who shared the outfit
  sharer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Who received the share
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Optional message from sharer
  message TEXT CHECK (LENGTH(message) <= 500),
  
  -- Has recipient viewed the shared outfit
  is_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_not_self_share CHECK (sharer_id != recipient_id),
  CONSTRAINT unique_outfit_share UNIQUE (outfit_id, sharer_id, recipient_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outfit_shares_recipient ON outfit_shares(recipient_id);
CREATE INDEX IF NOT EXISTS idx_outfit_shares_sharer ON outfit_shares(sharer_id);
CREATE INDEX IF NOT EXISTS idx_outfit_shares_outfit ON outfit_shares(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_shares_created ON outfit_shares(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_outfit_shares_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_outfit_shares_updated_at ON outfit_shares;
CREATE TRIGGER trigger_outfit_shares_updated_at
  BEFORE UPDATE ON outfit_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_outfit_shares_timestamp();

-- =============================================
-- 3. NOTIFICATION CREATION FUNCTIONS
-- =============================================

/**
 * Create notification when someone sends a friend request
 */
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification when status is 'pending' (new request)
  IF NEW.status = 'pending' THEN
    -- Determine who is the requester and receiver
    -- Since friends table uses canonical ordering (requester_id < receiver_id),
    -- we need to check who initiated the request
    
    -- Create notification for the receiver
    -- If requester_id < receiver_id, then requester initiated
    -- The notification should go to receiver_id
    INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
    VALUES (NEW.receiver_id, NEW.requester_id, 'friend_request', NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_friend_request ON friends;
CREATE TRIGGER trigger_notify_friend_request
AFTER INSERT ON friends
FOR EACH ROW
EXECUTE FUNCTION create_friend_request_notification();

/**
 * Create notification when someone accepts a friend request
 */
CREATE OR REPLACE FUNCTION create_friend_request_accepted_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification when status changes from 'pending' to 'accepted'
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Notify the original requester that their request was accepted
    -- The requester is always the one who sent the request
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_friend_request_accepted ON friends;
CREATE TRIGGER trigger_notify_friend_request_accepted
AFTER UPDATE ON friends
FOR EACH ROW
EXECUTE FUNCTION create_friend_request_accepted_notification();

/**
 * Create notification when someone shares an outfit
 */
CREATE OR REPLACE FUNCTION create_outfit_shared_notification()
RETURNS TRIGGER AS $$
DECLARE
  are_friends BOOLEAN;
BEGIN
  -- Verify they are friends
  SELECT EXISTS(
    SELECT 1 FROM friends
    WHERE status = 'accepted'
      AND (
        (requester_id = NEW.sharer_id AND receiver_id = NEW.recipient_id) OR
        (requester_id = NEW.recipient_id AND receiver_id = NEW.sharer_id)
      )
  ) INTO are_friends;
  
  -- Only create notification if they are friends
  IF are_friends THEN
    INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
    VALUES (NEW.recipient_id, NEW.sharer_id, 'outfit_shared', NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_outfit_shared ON outfit_shares;
CREATE TRIGGER trigger_notify_outfit_shared
AFTER INSERT ON outfit_shares
FOR EACH ROW
EXECUTE FUNCTION create_outfit_shared_notification();

-- =============================================
-- 4. HELPER FUNCTIONS
-- =============================================

/**
 * Share an outfit with friends
 * Creates outfit_shares records and notifications
 */
CREATE OR REPLACE FUNCTION share_outfit_with_friends(
  p_outfit_id UUID,
  p_recipient_ids UUID[],
  p_message TEXT DEFAULT NULL
)
RETURNS TABLE (
  recipient_id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_sharer_id UUID;
  v_recipient_id UUID;
  v_is_friend BOOLEAN;
  v_outfit_exists BOOLEAN;
BEGIN
  -- Get current user
  v_sharer_id := auth.uid();
  
  -- Verify outfit exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM outfits
    WHERE id = p_outfit_id
      AND owner_id = v_sharer_id
      AND removed_at IS NULL
  ) INTO v_outfit_exists;
  
  IF NOT v_outfit_exists THEN
    RETURN QUERY
    SELECT NULL::UUID, FALSE, 'Outfit not found or does not belong to you'::TEXT;
    RETURN;
  END IF;
  
  -- Process each recipient
  FOREACH v_recipient_id IN ARRAY p_recipient_ids
  LOOP
    -- Check if they are friends
    SELECT EXISTS(
      SELECT 1 FROM friends
      WHERE status = 'accepted'
        AND (
          (requester_id = v_sharer_id AND receiver_id = v_recipient_id) OR
          (requester_id = v_recipient_id AND receiver_id = v_sharer_id)
        )
    ) INTO v_is_friend;
    
    IF v_is_friend THEN
      -- Create outfit share (trigger will create notification)
      BEGIN
        INSERT INTO outfit_shares (outfit_id, sharer_id, recipient_id, message)
        VALUES (p_outfit_id, v_sharer_id, v_recipient_id, p_message)
        ON CONFLICT (outfit_id, sharer_id, recipient_id) DO NOTHING;
        
        RETURN QUERY
        SELECT v_recipient_id, TRUE, NULL::TEXT;
      EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT v_recipient_id, FALSE, SQLERRM;
      END;
    ELSE
      RETURN QUERY
      SELECT v_recipient_id, FALSE, 'Not friends with this user'::TEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Get shared outfits received by user
 */
CREATE OR REPLACE FUNCTION get_shared_outfits(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  share_id UUID,
  outfit_id UUID,
  outfit_name TEXT,
  sharer_id UUID,
  sharer_username TEXT,
  sharer_avatar TEXT,
  message TEXT,
  is_viewed BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    os.id AS share_id,
    os.outfit_id,
    o.outfit_name,
    os.sharer_id,
    u.username AS sharer_username,
    u.avatar AS sharer_avatar,
    os.message,
    os.is_viewed,
    os.created_at
  FROM outfit_shares os
  JOIN outfits o ON o.id = os.outfit_id
  JOIN users u ON u.id = os.sharer_id
  WHERE os.recipient_id = p_user_id
    AND o.removed_at IS NULL
  ORDER BY os.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Mark outfit share as viewed
 */
CREATE OR REPLACE FUNCTION mark_outfit_share_viewed(p_share_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE outfit_shares
  SET 
    is_viewed = TRUE,
    viewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_share_id
    AND recipient_id = auth.uid();
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Accept friend request
 * Updates friend status and creates notification
 */
CREATE OR REPLACE FUNCTION accept_friend_request(p_friendship_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_friendship RECORD;
BEGIN
  -- Get friendship details
  SELECT * INTO v_friendship
  FROM friends
  WHERE id = p_friendship_id
    AND receiver_id = auth.uid()
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update status (trigger will create notification)
  UPDATE friends
  SET 
    status = 'accepted',
    updated_at = NOW()
  WHERE id = p_friendship_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Reject friend request
 */
CREATE OR REPLACE FUNCTION reject_friend_request(p_friendship_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE friends
  SET 
    status = 'rejected',
    updated_at = NOW()
  WHERE id = p_friendship_id
    AND receiver_id = auth.uid()
    AND status = 'pending';
    
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark notification as read
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE reference_id = p_friendship_id
    AND type = 'friend_request'
    AND recipient_id = auth.uid();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on outfit_shares
ALTER TABLE outfit_shares ENABLE ROW LEVEL SECURITY;

-- Users can view shares they received
DROP POLICY IF EXISTS "Users can view received shares" ON outfit_shares;
CREATE POLICY "Users can view received shares"
  ON outfit_shares FOR SELECT
  USING (recipient_id = auth.uid());

-- Users can view shares they created
DROP POLICY IF EXISTS "Users can view sent shares" ON outfit_shares;
CREATE POLICY "Users can view sent shares"
  ON outfit_shares FOR SELECT
  USING (sharer_id = auth.uid());

-- Friends can share outfits with each other
DROP POLICY IF EXISTS "Friends can share outfits" ON outfit_shares;
CREATE POLICY "Friends can share outfits"
  ON outfit_shares FOR INSERT
  WITH CHECK (
    sharer_id = auth.uid() AND
    EXISTS(
      SELECT 1 FROM friends
      WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND receiver_id = recipient_id) OR
          (requester_id = recipient_id AND receiver_id = auth.uid())
        )
    )
  );

-- Users can update shares they received (mark as viewed)
DROP POLICY IF EXISTS "Users can update received shares" ON outfit_shares;
CREATE POLICY "Users can update received shares"
  ON outfit_shares FOR UPDATE
  USING (recipient_id = auth.uid());

-- Users can delete shares they sent or received
DROP POLICY IF EXISTS "Users can delete their shares" ON outfit_shares;
CREATE POLICY "Users can delete their shares"
  ON outfit_shares FOR DELETE
  USING (sharer_id = auth.uid() OR recipient_id = auth.uid());

-- =============================================
-- 6. UPDATE EXISTING FUNCTIONS
-- =============================================

-- Update the should_send_notification function to include new types
CREATE OR REPLACE FUNCTION should_send_notification(
  p_user_id UUID,
  p_notification_type VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_preferences notification_preferences;
  v_current_time TIME;
  v_is_quiet_hours BOOLEAN;
BEGIN
  -- Get user preferences
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences, create defaults and allow notification
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Check if push notifications are disabled
  IF NOT v_preferences.push_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check quiet hours
  IF v_preferences.quiet_hours_enabled THEN
    v_current_time := CURRENT_TIME;
    
    -- Handle quiet hours spanning midnight
    IF v_preferences.quiet_hours_start <= v_preferences.quiet_hours_end THEN
      v_is_quiet_hours := v_current_time >= v_preferences.quiet_hours_start 
                          AND v_current_time < v_preferences.quiet_hours_end;
    ELSE
      v_is_quiet_hours := v_current_time >= v_preferences.quiet_hours_start 
                          OR v_current_time < v_preferences.quiet_hours_end;
    END IF;
    
    -- Don't send during quiet hours (except urgent notifications)
    IF v_is_quiet_hours AND p_notification_type NOT IN ('quota_warning', 'friend_request') THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check specific notification type preference
  RETURN CASE p_notification_type
    WHEN 'friend_request' THEN v_preferences.friend_requests
    WHEN 'friend_request_accepted' THEN v_preferences.friend_accepted
    WHEN 'friend_accepted' THEN v_preferences.friend_accepted
    WHEN 'outfit_like' THEN v_preferences.outfit_likes
    WHEN 'outfit_comment' THEN v_preferences.outfit_comments
    WHEN 'item_like' THEN v_preferences.item_likes
    WHEN 'friend_outfit_suggestion' THEN v_preferences.friend_outfit_suggestions
    WHEN 'outfit_shared' THEN v_preferences.friend_outfit_suggestions -- Use same preference
    WHEN 'daily_suggestion' THEN v_preferences.daily_suggestions
    WHEN 'weather_alert' THEN v_preferences.weather_alerts
    WHEN 'quota_warning' THEN v_preferences.quota_warnings
    ELSE TRUE -- Allow unknown types by default
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. GRANT PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION share_outfit_with_friends(UUID, UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_shared_outfits(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_outfit_share_viewed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_friend_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_friend_request(UUID) TO authenticated;

-- =============================================
-- 8. COMMENTS & DOCUMENTATION
-- =============================================

COMMENT ON TABLE outfit_shares IS 'Tracks outfits shared between friends';
COMMENT ON COLUMN outfit_shares.is_viewed IS 'Whether recipient has viewed the shared outfit';

COMMENT ON FUNCTION create_friend_request_notification IS 'Creates notification when friend request is sent';
COMMENT ON FUNCTION create_friend_request_accepted_notification IS 'Creates notification when friend request is accepted';
COMMENT ON FUNCTION create_outfit_shared_notification IS 'Creates notification when outfit is shared';
COMMENT ON FUNCTION share_outfit_with_friends IS 'Share an outfit with multiple friends';
COMMENT ON FUNCTION get_shared_outfits IS 'Get outfits shared with user';
COMMENT ON FUNCTION mark_outfit_share_viewed IS 'Mark shared outfit as viewed';
COMMENT ON FUNCTION accept_friend_request IS 'Accept a pending friend request';
COMMENT ON FUNCTION reject_friend_request IS 'Reject a pending friend request';

-- =============================================
-- END OF MIGRATION
-- =============================================

COMMIT;

COMMENT ON SCHEMA public IS 'StyleSnap friend notifications migration complete';

