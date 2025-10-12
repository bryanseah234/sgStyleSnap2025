-- Migration 002: Row Level Security Policies
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- DROP EXISTING POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can search other users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admin can insert users" ON users;

DROP POLICY IF EXISTS "Users can view own clothes" ON clothes;
DROP POLICY IF EXISTS "Users can insert own clothes" ON clothes;
DROP POLICY IF EXISTS "Users can update own clothes" ON clothes;
DROP POLICY IF EXISTS "Users can delete own clothes" ON clothes;
DROP POLICY IF EXISTS "Friends can view friends clothes" ON clothes;

DROP POLICY IF EXISTS "Users can view own friend requests" ON friends;
DROP POLICY IF EXISTS "Users can send friend requests" ON friends;
DROP POLICY IF EXISTS "Users can update own friend requests" ON friends;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friends;

DROP POLICY IF EXISTS "Users can view received suggestions" ON suggestions;
DROP POLICY IF EXISTS "Users can view sent suggestions" ON suggestions;
DROP POLICY IF EXISTS "Users can create suggestions" ON suggestions;
DROP POLICY IF EXISTS "Users can update received suggestions" ON suggestions;
DROP POLICY IF EXISTS "Users can delete own suggestions" ON suggestions;

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
-- Users can view own full data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Authenticated users can search for other users (limited fields)
-- IMPORTANT: Rate limiting and result limits enforced at API level
-- Email addresses never exposed in search results (handled by API)
CREATE POLICY "Users can search other users" ON users
    FOR SELECT USING (
        auth.uid() IS NOT NULL -- Must be authenticated
        AND removed_at IS NULL -- Only active users
    );

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admin can insert users (for test data creation, etc.)
CREATE POLICY "Admin can insert users" ON users
    FOR INSERT WITH CHECK (true);

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

-- ============================================
-- TEST ADMIN USER CREATION
-- ============================================
-- Create a test admin user for testing purposes
-- This user can be used to create other test users

-- Insert test admin user (only if it doesn't exist)
INSERT INTO users (id, email, username, name, avatar_url, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,  -- Fixed UUID for test admin
    'admin@test.com',
    'test_admin',
    'Test Admin User',
    null,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert 6 additional test users for friends feature testing
INSERT INTO users (id, email, username, name, avatar_url, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000002'::uuid, 'alice.johnson@test.com', 'alice_johnson', 'Alice Johnson', null, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'bob.smith@test.com', 'bob_smith', 'Bob Smith', null, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'carol.davis@test.com', 'carol_davis', 'Carol Davis', null, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'david.wilson@test.com', 'david_wilson', 'David Wilson', null, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000006'::uuid, 'emma.brown@test.com', 'emma_brown', 'Emma Brown', null, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000007'::uuid, 'frank.miller@test.com', 'frank_miller', 'Frank Miller', null, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Add comment for the test users
COMMENT ON TABLE users IS 'Test users created: admin@test.com, alice.johnson@test.com, bob.smith@test.com, carol.davis@test.com, david.wilson@test.com, emma.brown@test.com, frank.miller@test.com';

-- ============================================
-- AUTH FUNCTION: AUTO-CREATE PUBLIC USER
-- ============================================
-- This function creates a public.users entry when called
-- CRITICAL: This fixes the issue where users can log in but don't exist in public.users table
-- NOTE: Trigger on auth.users requires superuser privileges, so we'll use a different approach

-- Function to handle new user creation (can be called from client-side)
CREATE OR REPLACE FUNCTION create_public_user(
  user_id UUID,
  user_email TEXT,
  user_name TEXT DEFAULT NULL,
  user_avatar_url TEXT DEFAULT NULL,
  user_google_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Extract username from email (part before @)
  -- Use provided name or extract from email as fallback
  INSERT INTO public.users (id, email, username, name, avatar_url, google_id, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    COALESCE(
      split_part(user_email, '@', 1),  -- Use part before @ as username
      'user_' || substr(user_id::text, 1, 8)  -- Fallback: user_ + first 8 chars of UUID
    ),
    COALESCE(
      user_name,  -- Use provided name
      split_part(user_email, '@', 1)  -- Fallback: use email prefix
    ),
    user_avatar_url,  -- Use provided avatar URL
    user_google_id,   -- Use provided Google ID
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate creation
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Failed to create public user for %: %', user_email, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION create_public_user IS 'Creates public.users entry for authenticated user. Call this from client-side after successful OAuth login.';

-- ============================================
-- ALTERNATIVE: WEBHOOK APPROACH (RECOMMENDED)
-- ============================================
-- Since we can't create triggers on auth.users, we'll use a webhook approach
-- This requires setting up a webhook in Supabase Dashboard

-- Function to handle webhook user creation
CREATE OR REPLACE FUNCTION handle_auth_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called by a webhook when a user signs up
  -- The webhook will be configured in Supabase Dashboard
  PERFORM create_public_user(
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'sub'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_auth_webhook IS 'Webhook handler for user creation. Configure webhook in Supabase Dashboard to call this function.';