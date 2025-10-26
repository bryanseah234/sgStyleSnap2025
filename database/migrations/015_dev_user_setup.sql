-- Migration 015: Development User Setup
-- This file adds a development user for testing friend requests without authentication

-- ============================================
-- ADD DEVELOPMENT USER
-- ============================================

-- Insert development user for testing (only if it doesn't exist)
INSERT INTO users (id, email, username, name, avatar_url, created_at, updated_at)
VALUES (
    'dev-user-123'::uuid,  -- Fixed UUID for development
    'dev@test.com',
    'dev_user',
    'Development User',
    null,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    updated_at = NOW();

-- Add a few more test users for friend request testing
INSERT INTO users (id, email, username, name, avatar_url, created_at, updated_at)
VALUES 
    ('dev-user-456'::uuid, 'test1@example.com', 'test_user_1', 'Test User 1', null, NOW(), NOW()),
    ('dev-user-789'::uuid, 'test2@example.com', 'test_user_2', 'Test User 2', null, NOW(), NOW()),
    ('dev-user-abc'::uuid, 'test3@example.com', 'test_user_3', 'Test User 3', null, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    updated_at = NOW();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Development users: dev-user-123 (dev@test.com), dev-user-456 (test1@example.com), dev-user-789 (test2@example.com), dev-user-abc (test3@example.com)';
