-- Migration: Notification Cleanup System (7-day retention)
-- Purpose: Implement automatic cleanup of notifications older than 7 days
-- Date: 2025-01-27
-- Safe to rerun: This migration uses IF NOT EXISTS and DROP IF EXISTS

-- Start transaction to ensure atomicity
BEGIN;

-- Check if notifications table exists before proceeding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE EXCEPTION 'notifications table does not exist. Please run previous migrations first.';
    END IF;
END $$;

-- Add status field to notifications table to track lifecycle
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'));

-- Add expiry tracking
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE 
DEFAULT (NOW() + INTERVAL '7 days');

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_notifications_expiry 
ON notifications(expires_at) 
WHERE status IN ('pending', 'accepted', 'rejected');

-- Create index for status-based queries
CREATE INDEX IF NOT EXISTS idx_notifications_status 
ON notifications(recipient_id, status, created_at DESC);

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete notifications older than 7 days
    DELETE FROM notifications 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO system_logs (action, details, created_at)
    VALUES (
        'notification_cleanup',
        json_build_object(
            'deleted_count', deleted_count,
            'cleanup_date', NOW()
        ),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update notification status when user acts on it
CREATE OR REPLACE FUNCTION update_notification_status(
    notification_id UUID,
    new_status VARCHAR(20)
)
RETURNS BOOLEAN AS $$
DECLARE
    current_notification RECORD;
BEGIN
    -- Validate status
    IF new_status NOT IN ('pending', 'accepted', 'rejected', 'expired') THEN
        RAISE EXCEPTION 'Invalid status: %', new_status;
    END IF;
    
    -- Get current notification
    SELECT * INTO current_notification 
    FROM notifications 
    WHERE id = notification_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update status and extend expiry for accepted/rejected (7 more days)
    IF new_status IN ('accepted', 'rejected') THEN
        UPDATE notifications 
        SET 
            status = new_status,
            expires_at = NOW() + INTERVAL '7 days',
            updated_at = NOW()
        WHERE id = notification_id;
    ELSE
        UPDATE notifications 
        SET 
            status = new_status,
            updated_at = NOW()
        WHERE id = notification_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

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
    type VARCHAR(50),
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

-- Function to get unread count within retention period
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM notifications 
    WHERE recipient_id = user_id
        AND is_read = FALSE
        AND expires_at > NOW();  -- Only count notifications within retention period
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set expiry when notification is created
CREATE OR REPLACE FUNCTION set_notification_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiry to 7 days from creation
    NEW.expires_at = NOW() + INTERVAL '7 days';
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_notification_expiry ON notifications;
CREATE TRIGGER trigger_set_notification_expiry
    BEFORE INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION set_notification_expiry();

-- Update existing notifications to have proper expiry (only if they don't have expiry set)
UPDATE notifications 
SET 
    expires_at = created_at + INTERVAL '7 days',
    updated_at = NOW()
WHERE expires_at IS NULL;

-- Create system_logs table if it doesn't exist (for cleanup tracking)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant necessary permissions (safe to rerun - GRANT is idempotent)
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION update_notification_status(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications_with_retention(UUID, INTEGER, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications_count(UUID) TO authenticated;

-- Add RLS policy for system_logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert system logs (drop if exists first)
DROP POLICY IF EXISTS "Service role can manage system logs" ON system_logs;
CREATE POLICY "Service role can manage system logs" ON system_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON FUNCTION cleanup_expired_notifications() IS 'Deletes notifications older than 7 days and logs cleanup activity';
COMMENT ON FUNCTION update_notification_status(UUID, VARCHAR) IS 'Updates notification status and extends expiry for accepted/rejected notifications';
COMMENT ON FUNCTION get_user_notifications_with_retention(UUID, INTEGER, INTEGER, BOOLEAN) IS 'Gets user notifications within 7-day retention period';
COMMENT ON FUNCTION get_unread_notifications_count(UUID) IS 'Gets count of unread notifications within retention period';
COMMENT ON COLUMN notifications.status IS 'Notification lifecycle status: pending, accepted, rejected, expired';
COMMENT ON COLUMN notifications.expires_at IS 'When this notification will be automatically deleted';

-- Commit the transaction
COMMIT;
