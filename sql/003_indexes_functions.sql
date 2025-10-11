-- Migration 003: Indexes and Functions
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- DROP EXISTING INDEXES
-- ============================================
DROP INDEX IF EXISTS idx_clothes_owner_id;
DROP INDEX IF EXISTS idx_clothes_removed_at;
DROP INDEX IF EXISTS idx_clothes_owner_privacy;
DROP INDEX IF EXISTS idx_clothes_category;
DROP INDEX IF EXISTS idx_friends_status;
DROP INDEX IF EXISTS idx_friends_requester_id;
DROP INDEX IF EXISTS idx_friends_receiver_id;
DROP INDEX IF EXISTS idx_friends_requester_status;
DROP INDEX IF EXISTS idx_friends_receiver_status;
DROP INDEX IF EXISTS idx_suggestions_to_user_id;
DROP INDEX IF EXISTS idx_suggestions_from_user_id;
DROP INDEX IF EXISTS idx_suggestions_created_at;
DROP INDEX IF EXISTS idx_suggestions_is_read;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_google_id;

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Clothes table indexes
CREATE INDEX idx_clothes_owner_id ON clothes(owner_id);
CREATE INDEX idx_clothes_removed_at ON clothes(removed_at);
CREATE INDEX idx_clothes_owner_privacy ON clothes(owner_id, privacy) WHERE removed_at IS NULL;
CREATE INDEX idx_clothes_category ON clothes(category) WHERE removed_at IS NULL;

-- Friends table indexes
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_requester_id ON friends(requester_id);
CREATE INDEX idx_friends_receiver_id ON friends(receiver_id);
CREATE INDEX idx_friends_requester_status ON friends(requester_id, status);
CREATE INDEX idx_friends_receiver_status ON friends(receiver_id, status);

-- Suggestions table indexes
CREATE INDEX idx_suggestions_to_user_id ON suggestions(to_user_id);
CREATE INDEX idx_suggestions_from_user_id ON suggestions(from_user_id); -- Missing index added
CREATE INDEX idx_suggestions_created_at ON suggestions(created_at DESC); -- For ordering recent suggestions
CREATE INDEX idx_suggestions_is_read ON suggestions(to_user_id, is_read); -- For unread suggestions

-- Users table indexes
CREATE INDEX idx_users_email ON users(email) WHERE removed_at IS NULL;
CREATE INDEX idx_users_google_id ON users(google_id) WHERE removed_at IS NULL;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check item quota (counts only user uploads, not catalog items)
-- NOTE: This function only COUNTS items. The API must enforce the 50 upload limit.
-- Usage: SELECT check_item_quota('user-uuid-here');
-- NOTE: In migration 005, this will be updated to exclude catalog items
CREATE OR REPLACE FUNCTION check_item_quota(user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM clothes 
    WHERE owner_id = user_id AND removed_at IS NULL;
$$ LANGUAGE sql STABLE;

-- Function to get friend's viewable items
-- NOTE: This function should be called with RLS enabled for additional security
CREATE OR REPLACE FUNCTION get_friend_closet(friend_id UUID, viewer_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    category VARCHAR(50),
    image_url TEXT,
    thumbnail_url TEXT,
    style_tags TEXT[],
    size VARCHAR(20),
    brand VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
    SELECT 
        c.id,
        c.name,
        c.category,
        c.image_url,
        c.thumbnail_url,
        c.style_tags,
        c.size,
        c.brand,
        c.created_at
    FROM clothes c
    WHERE c.owner_id = friend_id
    AND c.removed_at IS NULL
    AND c.privacy = 'friends'
    AND EXISTS (
        SELECT 1 FROM friends f
        WHERE ((f.requester_id = viewer_id AND f.receiver_id = friend_id) OR
               (f.requester_id = friend_id AND f.receiver_id = viewer_id))
        AND f.status = 'accepted'
    );
$$ LANGUAGE sql STABLE SECURITY INVOKER;

-- Function to permanently delete items that have been soft-deleted for 30+ days
-- This should be run as a scheduled job (e.g., daily via pg_cron or external cron)
-- Usage: SELECT cleanup_old_removed_items();
CREATE OR REPLACE FUNCTION cleanup_old_removed_items()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM clothes
    WHERE removed_at IS NOT NULL
    AND removed_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Permanently deleted % items that were soft-deleted 30+ days ago', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;