-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
-- Note: likes table commented out in schema, enable when implementing
-- ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- CLOTHES POLICIES
-- ============================================
-- ISSUE #12 FIX: Separate policies for better security and clarity

-- Users can view ALL their own items (private and friends)
CREATE POLICY "Users can view own clothes" ON clothes
    FOR SELECT USING (auth.uid() = owner_id);

-- Users can insert new items
CREATE POLICY "Users can insert own clothes" ON clothes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can update their own items
CREATE POLICY "Users can update own clothes" ON clothes
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can delete their own items (soft delete sets removed_at)
CREATE POLICY "Users can delete own clothes" ON clothes
    FOR DELETE USING (auth.uid() = owner_id);

-- ISSUE #11 FIX: Corrected logic - privacy check inside policy expression
-- Friends can view items marked 'friends' if friendship is accepted
CREATE POLICY "Friends can view friends clothes" ON clothes
    FOR SELECT USING (
        privacy = 'friends' 
        AND removed_at IS NULL
        AND EXISTS (
            SELECT 1 FROM friends
            WHERE (
                (requester_id = auth.uid() AND receiver_id = owner_id) OR
                (requester_id = owner_id AND receiver_id = auth.uid())
            )
            AND status = 'accepted'
        )
    );

-- ISSUE #13 FIX: Framework for future public items (DISABLED)
-- Uncomment when implementing public items feature
-- CREATE POLICY "Anyone can view public clothes" ON clothes
--     FOR SELECT USING (privacy = 'public' AND removed_at IS NULL);

-- ============================================
-- FRIENDS POLICIES
-- ============================================
-- ISSUE #15 FIX: Separate policies by operation for explicit control

-- Users can view their friendships (both sent and received)
CREATE POLICY "Users can view own friendships" ON friends
    FOR SELECT USING (
        auth.uid() = requester_id OR auth.uid() = receiver_id
    );

-- Users can send friend requests (only as requester, enforces ordering)
CREATE POLICY "Users can send friend requests" ON friends
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id 
        AND requester_id < receiver_id
        AND status = 'pending'
    );

-- Only the receiver can accept/reject pending requests
CREATE POLICY "Users can accept friend requests" ON friends
    FOR UPDATE USING (
        auth.uid() = receiver_id 
        AND status = 'pending'
    )
    WITH CHECK (
        auth.uid() = receiver_id 
        AND status IN ('accepted', 'rejected')
    );

-- Either party can delete the friendship
CREATE POLICY "Users can delete own friendships" ON friends
    FOR DELETE USING (
        auth.uid() = requester_id OR auth.uid() = receiver_id
    );

-- ============================================
-- SUGGESTIONS POLICIES
-- ============================================
-- ISSUE #14 FIX: Complete suggestion policies with validation

-- Users can view suggestions sent TO them
CREATE POLICY "Users can view received suggestions" ON suggestions
    FOR SELECT USING (auth.uid() = to_user_id);

-- Users can view suggestions sent BY them
CREATE POLICY "Users can view sent suggestions" ON suggestions
    FOR SELECT USING (auth.uid() = from_user_id);

-- Users can create suggestions
-- NOTE: Complex validation (friendship, item ownership, privacy) done at API level
CREATE POLICY "Users can create suggestions" ON suggestions
    FOR INSERT WITH CHECK (
        auth.uid() = from_user_id
        -- The following must be validated by the API before INSERT:
        -- 1. Friendship exists between from_user_id and to_user_id with status='accepted'
        -- 2. All items in suggested_item_ids belong to to_user_id
        -- 3. All items have privacy='friends'
        -- 4. Array length between 1-10 items (enforced by table constraint)
        -- 5. Message length <= 100 chars (enforced by table constraint)
    );

-- Users can mark received suggestions as read (update is_read, viewed_at)
CREATE POLICY "Users can update received suggestions" ON suggestions
    FOR UPDATE USING (auth.uid() = to_user_id)
    WITH CHECK (auth.uid() = to_user_id);

-- Users can delete suggestions they sent or received
CREATE POLICY "Users can delete own suggestions" ON suggestions
    FOR DELETE USING (
        auth.uid() = from_user_id OR auth.uid() = to_user_id
    );

-- ============================================
-- LIKES POLICIES (FUTURE FEATURE)
-- ============================================
-- Uncomment when implementing likes feature
-- CREATE POLICY "Users can view all likes" ON likes
--     FOR SELECT USING (true);
--
-- CREATE POLICY "Users can manage own likes" ON likes
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete own likes" ON likes
--     FOR DELETE USING (auth.uid() = user_id);