-- =============================================
-- StyleSnap: Push Notifications Migration
-- =============================================
-- Description: Adds push notification subscriptions and user preferences
-- Dependencies: 009_notifications_system.sql
-- Version: 1.0.0
-- =============================================

-- =============================================
-- 1. PUSH SUBSCRIPTIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Push subscription details (from PushSubscription.toJSON())
  endpoint TEXT NOT NULL UNIQUE,
  expiration_time TIMESTAMP WITH TIME ZONE,
  
  -- Keys for encryption
  p256dh TEXT NOT NULL, -- Public key for encryption
  auth TEXT NOT NULL,   -- Authentication secret
  
  -- Device/browser metadata
  user_agent TEXT,
  device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- Status tracking
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failed_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT unique_user_endpoint UNIQUE (user_id, endpoint)
);

-- Index for finding active subscriptions by user
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active 
  ON push_subscriptions(user_id) 
  WHERE is_active = TRUE;

-- Index for cleanup of failed subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_failed 
  ON push_subscriptions(failed_count) 
  WHERE failed_count > 0;

-- Index for finding expired subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_expiration 
  ON push_subscriptions(expiration_time) 
  WHERE expiration_time IS NOT NULL;

COMMENT ON TABLE push_subscriptions IS 'Web Push API subscriptions for push notifications';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Unique push service endpoint URL';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Client public key for message encryption (base64)';
COMMENT ON COLUMN push_subscriptions.auth IS 'Authentication secret for message encryption (base64)';
COMMENT ON COLUMN push_subscriptions.failed_count IS 'Number of consecutive failed push attempts';

-- =============================================
-- 2. NOTIFICATION PREFERENCES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Push notification preferences
  push_enabled BOOLEAN DEFAULT TRUE,
  
  -- Notification type preferences
  friend_requests BOOLEAN DEFAULT TRUE,
  friend_accepted BOOLEAN DEFAULT TRUE,
  outfit_likes BOOLEAN DEFAULT TRUE,
  outfit_comments BOOLEAN DEFAULT TRUE,
  item_likes BOOLEAN DEFAULT TRUE,
  friend_outfit_suggestions BOOLEAN DEFAULT TRUE,
  
  -- Advanced preferences
  daily_suggestions BOOLEAN DEFAULT FALSE,
  daily_suggestion_time TIME DEFAULT '08:00:00',
  weather_alerts BOOLEAN DEFAULT FALSE,
  quota_warnings BOOLEAN DEFAULT TRUE,
  
  -- Quiet hours (no notifications during this time)
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notification_preferences IS 'User preferences for push notifications';
COMMENT ON COLUMN notification_preferences.daily_suggestion_time IS 'Time to send daily outfit suggestion (24h format)';
COMMENT ON COLUMN notification_preferences.quiet_hours_start IS 'Start of quiet hours (no notifications)';

-- =============================================
-- 3. NOTIFICATION DELIVERY LOG
-- =============================================

CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Notification details
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE SET NULL,
  
  -- Delivery status
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'expired')),
  
  -- Error tracking
  error_message TEXT,
  status_code INTEGER,
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Index for querying delivery status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding failed deliveries
CREATE INDEX IF NOT EXISTS idx_notification_delivery_status 
  ON notification_delivery_log(status, user_id);

-- Index for recent deliveries
CREATE INDEX IF NOT EXISTS idx_notification_delivery_recent 
  ON notification_delivery_log(sent_at DESC);

COMMENT ON TABLE notification_delivery_log IS 'Log of push notification delivery attempts';
COMMENT ON COLUMN notification_delivery_log.status IS 'Delivery status: sent, delivered, failed, expired';

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- Push Subscriptions Policies
-- Users can only manage their own subscriptions
DROP POLICY IF EXISTS push_subscriptions_select_own ON push_subscriptions;
CREATE POLICY push_subscriptions_select_own 
  ON push_subscriptions FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS push_subscriptions_insert_own ON push_subscriptions;
CREATE POLICY push_subscriptions_insert_own 
  ON push_subscriptions FOR INSERT 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS push_subscriptions_update_own ON push_subscriptions;
CREATE POLICY push_subscriptions_update_own 
  ON push_subscriptions FOR UPDATE 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS push_subscriptions_delete_own ON push_subscriptions;
CREATE POLICY push_subscriptions_delete_own 
  ON push_subscriptions FOR DELETE 
  USING (user_id = auth.uid());

-- Notification Preferences Policies
-- Users can only view/update their own preferences
DROP POLICY IF EXISTS notification_preferences_select_own ON notification_preferences;
CREATE POLICY notification_preferences_select_own 
  ON notification_preferences FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS notification_preferences_insert_own ON notification_preferences;
CREATE POLICY notification_preferences_insert_own 
  ON notification_preferences FOR INSERT 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notification_preferences_update_own ON notification_preferences;
CREATE POLICY notification_preferences_update_own 
  ON notification_preferences FOR UPDATE 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS notification_preferences_delete_own ON notification_preferences;
CREATE POLICY notification_preferences_delete_own 
  ON notification_preferences FOR DELETE 
  USING (user_id = auth.uid());

-- Notification Delivery Log Policies
-- Users can only view their own delivery logs
DROP POLICY IF EXISTS notification_delivery_log_select_own ON notification_delivery_log;
CREATE POLICY notification_delivery_log_select_own 
  ON notification_delivery_log FOR SELECT 
  USING (user_id = auth.uid());

-- Only backend can insert delivery logs (via service role)
-- No INSERT/UPDATE/DELETE policies for regular users

-- =============================================
-- 5. TRIGGERS
-- =============================================

-- Update updated_at timestamp on push_subscriptions
CREATE OR REPLACE FUNCTION update_push_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_timestamp();

-- Update updated_at timestamp on notification_preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_timestamp();

-- Create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_create_notification_preferences ON users;
CREATE TRIGGER users_create_notification_preferences
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =============================================
-- 6. HELPER FUNCTIONS
-- =============================================

-- Get user's active push subscriptions
CREATE OR REPLACE FUNCTION get_user_push_subscriptions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT,
  device_type VARCHAR,
  last_used_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.endpoint,
    ps.p256dh,
    ps.auth,
    ps.device_type,
    ps.last_used_at
  FROM push_subscriptions ps
  WHERE ps.user_id = p_user_id
    AND ps.is_active = TRUE
    AND (ps.expiration_time IS NULL OR ps.expiration_time > NOW())
  ORDER BY ps.last_used_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark subscription as failed
CREATE OR REPLACE FUNCTION mark_subscription_failed(
  p_subscription_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE push_subscriptions
  SET 
    failed_count = failed_count + 1,
    is_active = CASE 
      WHEN failed_count + 1 >= 5 THEN FALSE -- Disable after 5 failures
      ELSE is_active
    END,
    updated_at = NOW()
  WHERE id = p_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset subscription failed count on success
CREATE OR REPLACE FUNCTION reset_subscription_failed_count(p_subscription_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE push_subscriptions
  SET 
    failed_count = 0,
    is_active = TRUE,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = p_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user should receive notification (based on preferences)
CREATE OR REPLACE FUNCTION should_send_notification(
  p_user_id UUID,
  p_notification_type VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_preferences notification_preferences;
  v_current_time TIME;
  v_is_quiet_hours BOOLEAN;
BEGIN
  -- Get user preferences
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences, create defaults and allow notification
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Check if push notifications are disabled
  IF NOT v_preferences.push_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check quiet hours
  IF v_preferences.quiet_hours_enabled THEN
    v_current_time := CURRENT_TIME;
    
    -- Handle quiet hours spanning midnight
    IF v_preferences.quiet_hours_start <= v_preferences.quiet_hours_end THEN
      v_is_quiet_hours := v_current_time >= v_preferences.quiet_hours_start 
                          AND v_current_time < v_preferences.quiet_hours_end;
    ELSE
      v_is_quiet_hours := v_current_time >= v_preferences.quiet_hours_start 
                          OR v_current_time < v_preferences.quiet_hours_end;
    END IF;
    
    -- Don't send during quiet hours (except urgent notifications)
    IF v_is_quiet_hours AND p_notification_type NOT IN ('quota_warning') THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check specific notification type preference
  RETURN CASE p_notification_type
    WHEN 'friend_request' THEN v_preferences.friend_requests
    WHEN 'friend_accepted' THEN v_preferences.friend_accepted
    WHEN 'outfit_like' THEN v_preferences.outfit_likes
    WHEN 'outfit_comment' THEN v_preferences.outfit_comments
    WHEN 'item_like' THEN v_preferences.item_likes
    WHEN 'friend_outfit_suggestion' THEN v_preferences.friend_outfit_suggestions
    WHEN 'daily_suggestion' THEN v_preferences.daily_suggestions
    WHEN 'weather_alert' THEN v_preferences.weather_alerts
    WHEN 'quota_warning' THEN v_preferences.quota_warnings
    ELSE TRUE -- Allow unknown types by default
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired and failed subscriptions (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_push_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete expired subscriptions
  DELETE FROM push_subscriptions
  WHERE expiration_time IS NOT NULL 
    AND expiration_time < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Deactivate subscriptions with many failures (>10)
  UPDATE push_subscriptions
  SET is_active = FALSE
  WHERE failed_count > 10 
    AND is_active = TRUE;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get notification statistics for analytics
CREATE OR REPLACE FUNCTION get_notification_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_sent INTEGER,
  total_delivered INTEGER,
  total_failed INTEGER,
  delivery_rate NUMERIC,
  most_common_failure TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_sent,
    COUNT(*) FILTER (WHERE status = 'delivered')::INTEGER AS total_delivered,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER AS total_failed,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'delivered')::NUMERIC / 
      NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
      2
    ) AS delivery_rate,
    MODE() WITHIN GROUP (ORDER BY error_message) AS most_common_failure
  FROM notification_delivery_log
  WHERE user_id = p_user_id
    AND sent_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. INDEXES FOR PERFORMANCE
-- =============================================

-- Index for finding subscriptions by endpoint (for unsubscribe)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
  ON push_subscriptions(endpoint);

-- Index for user preferences lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user 
  ON notification_preferences(user_id);

-- Index for delivery log queries by notification
CREATE INDEX IF NOT EXISTS idx_notification_delivery_notification 
  ON notification_delivery_log(notification_id);

-- =============================================
-- 8. COMMENTS & DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION get_user_push_subscriptions IS 'Get all active push subscriptions for a user';
COMMENT ON FUNCTION mark_subscription_failed IS 'Increment failed count and disable after 5 failures';
COMMENT ON FUNCTION should_send_notification IS 'Check if notification should be sent based on user preferences';
COMMENT ON FUNCTION cleanup_expired_push_subscriptions IS 'Remove expired and failed subscriptions (run via cron)';

-- =============================================
-- 9. INITIAL DATA / SEED
-- =============================================

-- Create default preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- END OF MIGRATION
-- =============================================

COMMENT ON SCHEMA public IS 'StyleSnap push notifications migration complete';
