-- Row Level Security (RLS) Policies for StyleSnap
-- Ensures users can only access their own data and appropriate shared data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view friend profiles" ON users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT friend_id FROM friends 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

-- Clothes table policies
CREATE POLICY "Users can view own clothes" ON clothes
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own clothes" ON clothes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own clothes" ON clothes
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own clothes" ON clothes
    FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Users can view friend's public clothes" ON clothes
    FOR SELECT USING (
        privacy = 'public' AND
        owner_id IN (
            SELECT friend_id FROM friends 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

-- Outfits table policies
CREATE POLICY "Users can view own outfits" ON outfits
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own outfits" ON outfits
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own outfits" ON outfits
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own outfits" ON outfits
    FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public outfits" ON outfits
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view friend's outfits" ON outfits
    FOR SELECT USING (
        owner_id IN (
            SELECT friend_id FROM friends 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

-- Outfit items table policies
CREATE POLICY "Users can view outfit items for own outfits" ON outfit_items
    FOR SELECT USING (
        outfit_id IN (
            SELECT id FROM outfits WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outfit items for own outfits" ON outfit_items
    FOR INSERT WITH CHECK (
        outfit_id IN (
            SELECT id FROM outfits WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update outfit items for own outfits" ON outfit_items
    FOR UPDATE USING (
        outfit_id IN (
            SELECT id FROM outfits WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outfit items for own outfits" ON outfit_items
    FOR DELETE USING (
        outfit_id IN (
            SELECT id FROM outfits WHERE owner_id = auth.uid()
        )
    );

-- Friends table policies
CREATE POLICY "Users can view own friendships" ON friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert own friendships" ON friends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships" ON friends
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendships" ON friends
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Friend requests table policies
CREATE POLICY "Users can view own friend requests" ON friend_requests
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert own friend requests" ON friend_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friend requests" ON friend_requests
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friend requests" ON friend_requests
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Activities table policies
CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view friend activities" ON activities
    FOR SELECT USING (
        user_id IN (
            SELECT friend_id FROM friends 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

-- Outfit likes table policies
CREATE POLICY "Users can view all outfit likes" ON outfit_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own outfit likes" ON outfit_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfit likes" ON outfit_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Clothing likes table policies
CREATE POLICY "Users can view all clothing likes" ON clothing_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own clothing likes" ON clothing_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clothing likes" ON clothing_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Wishlist table policies
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items" ON wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items" ON wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- Public read access for reference tables
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active brands" ON brands
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active colors" ON colors
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active styles" ON styles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active catalog items" ON catalog_items
    FOR SELECT USING (is_active = true);

-- Create function to check if users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM friends 
        WHERE (user_id = user1_id AND friend_id = user2_id) 
           OR (user_id = user2_id AND friend_id = user1_id)
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's friends
CREATE OR REPLACE FUNCTION get_user_friends(user_id UUID)
RETURNS TABLE(friend_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT f.friend_id FROM friends f
    WHERE f.user_id = user_id AND f.status = 'accepted'
    UNION
    SELECT f.user_id FROM friends f
    WHERE f.friend_id = user_id AND f.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user owns resource
CREATE OR REPLACE FUNCTION user_owns_resource(resource_owner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() = resource_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if resource is public
CREATE OR REPLACE FUNCTION is_public_resource(privacy_level VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN privacy_level = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant permissions for RLS functions
GRANT EXECUTE ON FUNCTION are_friends(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_friends(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION user_owns_resource(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_public_resource(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_outfit_likes(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_outfit_likes(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_clothing_likes(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_clothing_likes(UUID) TO anon, authenticated;
