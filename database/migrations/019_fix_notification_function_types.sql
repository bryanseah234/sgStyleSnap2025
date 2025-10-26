-- Migration 019: Fix notification function type mismatch
-- =============================================================================
-- Fixes the type mismatch in get_user_notifications_with_retention function
-- where the function definition had VARCHAR(50) but the actual table column is TEXT

-- Drop and recreate the function with correct types
DROP FUNCTION IF EXISTS get_user_notifications_with_retention(UUID, INTEGER, INTEGER, BOOLEAN);

-- Function to get notifications within retention period
CREATE OR REPLACE FUNCTION get_user_notifications_with_retention(
    user_id UUID,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0,
    unread_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    recipient_id UUID,
    actor_id UUID,
    type TEXT,  -- Fixed: was VARCHAR(50), now matches table schema
    reference_id UUID,
    custom_message TEXT,
    is_read BOOLEAN,
    status VARCHAR(20),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    actor_username VARCHAR(50),
    actor_avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.recipient_id,
        n.actor_id,
        n.type,
        n.reference_id,
        n.custom_message,
        n.is_read,
        n.status,
        n.expires_at,
        n.created_at,
        n.updated_at,
        u.username as actor_username,
        u.avatar_url as actor_avatar_url
    FROM notifications n
    LEFT JOIN users u ON n.actor_id = u.id
    WHERE n.recipient_id = user_id
        AND n.expires_at > NOW()  -- Only show notifications within retention period
        AND (NOT unread_only OR n.is_read = FALSE)
    ORDER BY n.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_notifications_with_retention IS 'Get user notifications within 7-day retention period with correct type definitions';
