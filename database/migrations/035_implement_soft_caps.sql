-- ============================================
-- Implement Soft Caps: 50 Outfits, 50 Items, 50 Friends
-- ============================================
-- This migration implements soft caps for user content to prevent
-- unlimited growth and ensure good performance.

BEGIN;

-- ============================================
-- 1. CREATE QUOTA CHECK FUNCTIONS
-- ============================================

-- Function to check outfit quota
CREATE OR REPLACE FUNCTION check_outfit_quota(user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM outfits 
    WHERE owner_id = user_id AND removed_at IS NULL;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION check_outfit_quota IS 'Counts user-created outfits (excludes soft-deleted). Returns count for quota enforcement.';

-- Function to check friends quota
CREATE OR REPLACE FUNCTION check_friends_quota(user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM friends 
    WHERE (requester_id = user_id OR receiver_id = user_id) 
    AND status = 'accepted';
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION check_friends_quota IS 'Counts accepted friendships for user. Returns count for quota enforcement.';

-- Update the existing item quota function to be more explicit
CREATE OR REPLACE FUNCTION check_item_quota(user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM clothes 
    WHERE owner_id = user_id 
      AND removed_at IS NULL 
      AND catalog_item_id IS NULL; -- Only count user uploads, not catalog additions
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION check_item_quota IS 'Counts user-uploaded items only (excludes catalog additions). Returns count for quota enforcement.';

-- ============================================
-- 2. CREATE QUOTA ENFORCEMENT FUNCTIONS
-- ============================================

-- Function to check if user can create more outfits
CREATE OR REPLACE FUNCTION can_create_outfit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT check_outfit_quota(user_id) INTO current_count;
    RETURN current_count < 50;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION can_create_outfit IS 'Returns true if user can create more outfits (under 50 limit).';

-- Function to check if user can upload more items
CREATE OR REPLACE FUNCTION can_upload_item(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT check_item_quota(user_id) INTO current_count;
    RETURN current_count < 50;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION can_upload_item IS 'Returns true if user can upload more items (under 50 limit).';

-- Function to check if user can add more friends
CREATE OR REPLACE FUNCTION can_add_friend(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT check_friends_quota(user_id) INTO current_count;
    RETURN current_count < 50;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION can_add_friend IS 'Returns true if user can add more friends (under 50 limit).';

-- ============================================
-- 3. CREATE QUOTA WARNING FUNCTIONS
-- ============================================

-- Function to check if user is approaching quota limits
CREATE OR REPLACE FUNCTION check_quota_warnings(user_id UUID)
RETURNS TABLE (
    quota_type TEXT,
    current_count INTEGER,
    limit_count INTEGER,
    warning_threshold INTEGER,
    is_warning BOOLEAN,
    is_limit_reached BOOLEAN
) AS $$
BEGIN
    -- Check outfits quota
    RETURN QUERY
    SELECT 
        'outfits'::TEXT,
        check_outfit_quota(user_id),
        50,
        40, -- Warning at 80% (40/50)
        check_outfit_quota(user_id) >= 40,
        check_outfit_quota(user_id) >= 50;
    
    -- Check items quota
    RETURN QUERY
    SELECT 
        'items'::TEXT,
        check_item_quota(user_id),
        50,
        40, -- Warning at 80% (40/50)
        check_item_quota(user_id) >= 40,
        check_item_quota(user_id) >= 50;
    
    -- Check friends quota
    RETURN QUERY
    SELECT 
        'friends'::TEXT,
        check_friends_quota(user_id),
        50,
        40, -- Warning at 80% (40/50)
        check_friends_quota(user_id) >= 40,
        check_friends_quota(user_id) >= 50;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_quota_warnings IS 'Returns quota status for all user content types with warning thresholds.';

-- ============================================
-- 4. CREATE QUOTA ENFORCEMENT TRIGGERS
-- ============================================

-- Trigger function to enforce outfit quota
CREATE OR REPLACE FUNCTION enforce_outfit_quota()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    -- Check current outfit count
    SELECT check_outfit_quota(NEW.owner_id) INTO current_count;
    
    -- Enforce soft cap (50 outfits)
    IF current_count >= 50 THEN
        RAISE EXCEPTION 'Outfit quota exceeded. You can create up to 50 outfits. Please delete some outfits to create new ones.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for outfit quota enforcement
DROP TRIGGER IF EXISTS trigger_enforce_outfit_quota ON outfits;
CREATE TRIGGER trigger_enforce_outfit_quota
    BEFORE INSERT ON outfits
    FOR EACH ROW
    EXECUTE FUNCTION enforce_outfit_quota();

-- Trigger function to enforce item upload quota
CREATE OR REPLACE FUNCTION enforce_item_quota()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    -- Only enforce quota for user uploads (not catalog additions)
    IF NEW.catalog_item_id IS NULL THEN
        -- Check current item count
        SELECT check_item_quota(NEW.owner_id) INTO current_count;
        
        -- Enforce soft cap (50 items)
        IF current_count >= 50 THEN
            RAISE EXCEPTION 'Item upload quota exceeded. You can upload up to 50 items. Please delete some items to upload new ones.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for item quota enforcement
DROP TRIGGER IF EXISTS trigger_enforce_item_quota ON clothes;
CREATE TRIGGER trigger_enforce_item_quota
    BEFORE INSERT ON clothes
    FOR EACH ROW
    EXECUTE FUNCTION enforce_item_quota();

-- Trigger function to enforce friends quota
CREATE OR REPLACE FUNCTION enforce_friends_quota()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    -- Check current friends count for both requester and receiver
    SELECT check_friends_quota(NEW.requester_id) INTO current_count;
    
    -- Enforce soft cap (50 friends)
    IF current_count >= 50 THEN
        RAISE EXCEPTION 'Friends quota exceeded. You can have up to 50 friends. Please remove some friends to add new ones.';
    END IF;
    
    -- Also check receiver's quota
    SELECT check_friends_quota(NEW.receiver_id) INTO current_count;
    IF current_count >= 50 THEN
        RAISE EXCEPTION 'Friend request cannot be sent. The user has reached their friends limit (50).';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for friends quota enforcement
DROP TRIGGER IF EXISTS trigger_enforce_friends_quota ON friends;
CREATE TRIGGER trigger_enforce_friends_quota
    BEFORE INSERT ON friends
    FOR EACH ROW
    EXECUTE FUNCTION enforce_friends_quota();

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_outfit_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_friends_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_item_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_outfit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_upload_item(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_add_friend(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_quota_warnings(UUID) TO authenticated;

-- ============================================
-- 6. VERIFY FUNCTIONS WERE CREATED
-- ============================================

-- Check that all functions were created successfully
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN (
    'check_outfit_quota',
    'check_friends_quota', 
    'check_item_quota',
    'can_create_outfit',
    'can_upload_item',
    'can_add_friend',
    'check_quota_warnings'
)
AND routine_schema = 'public'
ORDER BY routine_name;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this migration, test with these queries:

-- 1. Check current quotas for a user:
-- SELECT * FROM check_quota_warnings('user-uuid-here');

-- 2. Check if user can create outfit:
-- SELECT can_create_outfit('user-uuid-here');

-- 3. Check if user can upload item:
-- SELECT can_upload_item('user-uuid-here');

-- 4. Check if user can add friend:
-- SELECT can_add_friend('user-uuid-here');

-- 5. Test quota enforcement by trying to exceed limits:
-- INSERT INTO outfits (owner_id, outfit_name) VALUES ('user-uuid', 'Test Outfit 51');
-- INSERT INTO clothes (owner_id, name, image_url, catalog_item_id) VALUES ('user-uuid', 'Test Item 51', 'test.jpg', NULL);
-- INSERT INTO friends (requester_id, receiver_id, status) VALUES ('user-uuid', 'friend-uuid', 'pending');
