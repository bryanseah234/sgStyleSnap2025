-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Clothes policies
CREATE POLICY "Users can manage own clothes" ON clothes
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Friends can view friends clothes" ON clothes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE (requester_id = auth.uid() AND receiver_id = owner_id OR
                   requester_id = owner_id AND receiver_id = auth.uid())
            AND status = 'accepted'
        )
        AND privacy = 'friends'
    );

-- Friends policies
CREATE POLICY "Users can manage own friend relationships" ON friends
    FOR ALL USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Suggestions policies
CREATE POLICY "Users can view received suggestions" ON suggestions
    FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Users can create suggestions" ON suggestions
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Likes policies (for future)
CREATE POLICY "Users can manage own likes" ON likes
    FOR ALL USING (auth.uid() = user_id);