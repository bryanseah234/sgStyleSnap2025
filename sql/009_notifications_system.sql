-- Migration 009: Notification System
-- This file is re-runnable - safe to execute multiple times
-- Date: October 7, 2025
--
-- Features:
--   1. Friend outfit suggestions with approval workflow
--   2. Likes notifications on outfits and individual items
--   3. Centralized notifications table
--   4. Real-time notification triggers

-- =============================================================================
-- DROP EXISTING OBJECTS (in reverse dependency order)
-- =============================================================================

-- Drop triggers first
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_notify_friend_outfit_suggestion ON friend_outfit_suggestions;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_notify_outfit_like ON shared_outfit_likes;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_notify_item_like ON item_likes;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_friend_outfit_suggestions_updated_at ON friend_outfit_suggestions;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Drop functions
DO $$ BEGIN
  DROP FUNCTION IF EXISTS create_friend_suggestion_notification() CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS create_outfit_like_notification() CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS create_item_like_notification() CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS get_user_notifications(UUID, INT, INT) CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS mark_notification_read(UUID) CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID) CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS get_unread_notification_count(UUID) CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS approve_friend_outfit_suggestion(UUID) CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS reject_friend_outfit_suggestion(UUID) CASCADE;
  EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Drop tables
DO $$ BEGIN
  DROP TABLE IF EXISTS notifications CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS friend_outfit_suggestions CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS item_likes CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- =============================================================================
-- 1. ITEM LIKES TABLE
-- =============================================================================
-- Allows friends to like individual closet items
-- Different from shared_outfit_likes (which is for social feed posts)

CREATE TABLE item_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One like per user per item
  UNIQUE(item_id, user_id),
  
  -- Only friends can like items (enforced by RLS policy)
  CONSTRAINT check_friend_relationship CHECK (
    user_id != (SELECT owner_id FROM clothes WHERE id = item_id)
  )
);

-- Indexes
CREATE INDEX idx_item_likes_item_id ON item_likes(item_id);
CREATE INDEX idx_item_likes_user_id ON item_likes(user_id);
CREATE INDEX idx_item_likes_created_at ON item_likes(created_at DESC);

-- Add likes_count to clothes table for denormalization (performance)
ALTER TABLE clothes ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;

-- Function to update item likes count
CREATE OR REPLACE FUNCTION update_item_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE clothes SET likes_count = likes_count + 1 WHERE id = NEW.item_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE clothes SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update likes count
CREATE TRIGGER trigger_update_item_likes_count
AFTER INSERT OR DELETE ON item_likes
FOR EACH ROW
EXECUTE FUNCTION update_item_likes_count();

-- =============================================================================
-- 2. FRIEND OUTFIT SUGGESTIONS TABLE
-- =============================================================================
-- Friends can create outfits using user's closet items and suggest them
-- User must approve before outfit is added to their generated_outfits

CREATE TABLE friend_outfit_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Who owns the closet (receiver of suggestion)
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Who is suggesting the outfit (must be friend)
  suggester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Outfit details (items must belong to owner_id's closet)
  outfit_items JSONB NOT NULL,
  -- Structure: [{ clothes_id: 'uuid', category: 'top', image_url: 'url' }, ...]
  
  -- Optional message from suggester
  message TEXT,
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  
  -- When approved, store the generated_outfit_id
  generated_outfit_id UUID REFERENCES generated_outfits(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT check_not_self_suggestion CHECK (owner_id != suggester_id),
  CONSTRAINT check_outfit_items_not_empty CHECK (jsonb_array_length(outfit_items) > 0),
  CONSTRAINT check_message_length CHECK (message IS NULL OR LENGTH(message) <= 500)
);

-- Indexes
CREATE INDEX idx_friend_outfit_suggestions_owner_id ON friend_outfit_suggestions(owner_id);
CREATE INDEX idx_friend_outfit_suggestions_suggester_id ON friend_outfit_suggestions(suggester_id);
CREATE INDEX idx_friend_outfit_suggestions_status ON friend_outfit_suggestions(status);
CREATE INDEX idx_friend_outfit_suggestions_created_at ON friend_outfit_suggestions(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER trigger_friend_outfit_suggestions_updated_at
BEFORE UPDATE ON friend_outfit_suggestions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. NOTIFICATIONS TABLE
-- =============================================================================
-- Centralized notification system for all notification types

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Who receives the notification
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Who triggered the notification (can be NULL for system notifications)
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification type
  type TEXT NOT NULL CHECK (
    type IN (
      'friend_outfit_suggestion',  -- Friend suggested an outfit
      'outfit_like',                -- Friend liked a shared outfit
      'item_like'                   -- Friend liked a closet item
    )
  ),
  
  -- Reference to related entity
  reference_id UUID NOT NULL,  -- ID of suggestion, outfit, or item
  
  -- Read status
  is_read BOOLEAN DEFAULT FALSE,
  
  -- Optional custom message (overrides default message)
  custom_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT check_custom_message_length CHECK (
    custom_message IS NULL OR LENGTH(custom_message) <= 200
  )
);

-- Indexes
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_reference_id ON notifications(reference_id);

-- Trigger for updated_at
CREATE TRIGGER trigger_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. NOTIFICATION CREATION FUNCTIONS
-- =============================================================================

/**
 * Create notification when friend suggests an outfit
 */
CREATE OR REPLACE FUNCTION create_friend_suggestion_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
  VALUES (NEW.owner_id, NEW.suggester_id, 'friend_outfit_suggestion', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_friend_outfit_suggestion
AFTER INSERT ON friend_outfit_suggestions
FOR EACH ROW
EXECUTE FUNCTION create_friend_suggestion_notification();

/**
 * Create notification when friend likes a shared outfit
 * Only notify if liker is a friend
 */
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
      VALUES (outfit_owner_id, NEW.user_id, 'outfit_like', NEW.outfit_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_outfit_like
AFTER INSERT ON shared_outfit_likes
FOR EACH ROW
EXECUTE FUNCTION create_outfit_like_notification();

/**
 * Create notification when friend likes a closet item
 * Only notify if liker is a friend
 */
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
      VALUES (item_owner_id, NEW.user_id, 'item_like', NEW.item_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_item_like
AFTER INSERT ON item_likes
FOR EACH ROW
EXECUTE FUNCTION create_item_like_notification();

-- =============================================================================
-- 5. NOTIFICATION HELPER FUNCTIONS
-- =============================================================================

/**
 * Get user notifications with pagination
 * Returns notifications with actor details
 */
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  notification_id UUID,
  type TEXT,
  is_read BOOLEAN,
  reference_id UUID,
  created_at TIMESTAMPTZ,
  actor_id UUID,
  actor_username TEXT,
  actor_avatar TEXT,
  custom_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id AS notification_id,
    n.type,
    n.is_read,
    n.reference_id,
    n.created_at,
    n.actor_id,
    u.username AS actor_username,
    u.avatar AS actor_avatar,
    n.custom_message
  FROM notifications n
  LEFT JOIN users u ON u.id = n.actor_id
  WHERE n.recipient_id = p_user_id
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Mark a single notification as read
 */
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id
    AND recipient_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Mark all notifications as read for a user
 */
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE recipient_id = p_user_id
    AND is_read = FALSE
    AND recipient_id = auth.uid();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Get unread notification count
 */
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  unread_count INT;
BEGIN
  SELECT COUNT(*)::INT INTO unread_count
  FROM notifications
  WHERE recipient_id = p_user_id
    AND is_read = FALSE;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Approve friend outfit suggestion
 * Creates a generated_outfit and updates suggestion status
 */
CREATE OR REPLACE FUNCTION approve_friend_outfit_suggestion(p_suggestion_id UUID)
RETURNS UUID AS $$
DECLARE
  v_suggestion RECORD;
  v_outfit_id UUID;
BEGIN
  -- Get suggestion details
  SELECT * INTO v_suggestion
  FROM friend_outfit_suggestions
  WHERE id = p_suggestion_id
    AND owner_id = auth.uid()
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found or already processed';
  END IF;
  
  -- Create generated outfit
  INSERT INTO generated_outfits (
    user_id,
    outfit_items,
    is_manual,
    created_by_friend,
    friend_suggester_id
  ) VALUES (
    v_suggestion.owner_id,
    v_suggestion.outfit_items,
    TRUE,  -- Manual since friend created it
    TRUE,  -- Flag as friend-created
    v_suggestion.suggester_id
  ) RETURNING id INTO v_outfit_id;
  
  -- Update suggestion status
  UPDATE friend_outfit_suggestions
  SET 
    status = 'approved',
    generated_outfit_id = v_outfit_id,
    responded_at = NOW()
  WHERE id = p_suggestion_id;
  
  -- Mark notification as read
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE reference_id = p_suggestion_id
    AND recipient_id = auth.uid()
    AND type = 'friend_outfit_suggestion';
  
  RETURN v_outfit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Reject friend outfit suggestion
 */
CREATE OR REPLACE FUNCTION reject_friend_outfit_suggestion(p_suggestion_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update suggestion status
  UPDATE friend_outfit_suggestions
  SET 
    status = 'rejected',
    responded_at = NOW()
  WHERE id = p_suggestion_id
    AND owner_id = auth.uid()
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found or already processed';
  END IF;
  
  -- Mark notification as read
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE reference_id = p_suggestion_id
    AND recipient_id = auth.uid()
    AND type = 'friend_outfit_suggestion';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_outfit_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_likes ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- Friend outfit suggestions policies
CREATE POLICY "Users can view suggestions they received"
  ON friend_outfit_suggestions FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view suggestions they created"
  ON friend_outfit_suggestions FOR SELECT
  USING (suggester_id = auth.uid());

CREATE POLICY "Friends can create outfit suggestions"
  ON friend_outfit_suggestions FOR INSERT
  WITH CHECK (
    suggester_id = auth.uid() AND
    EXISTS(
      SELECT 1 FROM friends
      WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND receiver_id = owner_id) OR
          (requester_id = owner_id AND receiver_id = auth.uid())
        )
    )
  );

CREATE POLICY "Users can update suggestions they received"
  ON friend_outfit_suggestions FOR UPDATE
  USING (owner_id = auth.uid());

-- Item likes policies
CREATE POLICY "Users can view likes on their items"
  ON item_likes FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM clothes WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own likes"
  ON item_likes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view likes on friends' items"
  ON item_likes FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM clothes c
      JOIN friends f ON (
        (f.requester_id = auth.uid() AND f.receiver_id = c.owner_id) OR
        (f.requester_id = c.owner_id AND f.receiver_id = auth.uid())
      )
      WHERE c.id = item_likes.item_id
        AND f.status = 'accepted'
    )
  );

CREATE POLICY "Friends can like items"
  ON item_likes FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS(
      SELECT 1 FROM clothes c
      JOIN friends f ON (
        (f.requester_id = auth.uid() AND f.receiver_id = c.owner_id) OR
        (f.requester_id = c.owner_id AND f.receiver_id = auth.uid())
      )
      WHERE c.id = item_id
        AND f.status = 'accepted'
        AND c.owner_id != auth.uid()  -- Can't like own items
    )
  );

CREATE POLICY "Users can delete their own likes"
  ON item_likes FOR DELETE
  USING (user_id = auth.uid());

-- =============================================================================
-- 7. UPDATE GENERATED_OUTFITS TABLE
-- =============================================================================
-- Add fields to track friend-created outfits

ALTER TABLE generated_outfits 
  ADD COLUMN IF NOT EXISTS created_by_friend BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS friend_suggester_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Index for friend suggestions
CREATE INDEX IF NOT EXISTS idx_generated_outfits_friend_created 
  ON generated_outfits(user_id, created_by_friend) 
  WHERE created_by_friend = TRUE;

-- =============================================================================
-- 8. DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE notifications IS 'Centralized notification system for friend suggestions, outfit likes, and item likes';
COMMENT ON TABLE friend_outfit_suggestions IS 'Friend-created outfit suggestions with approval workflow';
COMMENT ON TABLE item_likes IS 'Likes on individual closet items by friends';

COMMENT ON COLUMN friend_outfit_suggestions.outfit_items IS 'JSONB array of outfit items with structure: [{ clothes_id, category, image_url }]';
COMMENT ON COLUMN friend_outfit_suggestions.status IS 'pending: awaiting approval, approved: added to closet, rejected: declined';
COMMENT ON COLUMN notifications.type IS 'friend_outfit_suggestion | outfit_like | item_like';

COMMENT ON FUNCTION get_user_notifications IS 'Get paginated notifications with actor details';
COMMENT ON FUNCTION approve_friend_outfit_suggestion IS 'Approve suggestion and add outfit to closet';
COMMENT ON FUNCTION reject_friend_outfit_suggestion IS 'Reject suggestion and mark notification as read';
