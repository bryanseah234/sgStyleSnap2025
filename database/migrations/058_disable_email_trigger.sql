-- Migration 058: Disable Database Trigger (Use Webhooks Instead)
-- Since pg_net is not working and webhooks are more reliable,
-- disable the database trigger and rely on Supabase webhooks
-- Date: January 2025

BEGIN;

-- Disable the database trigger (if it exists)
-- Webhooks will handle email notifications instead
DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;

COMMIT;

-- Verify trigger is disabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_send_email_notification'
    AND event_object_table = 'notifications'
  ) THEN
    RAISE WARNING '⚠️  Trigger still exists - webhook will send duplicate emails!';
  ELSE
    RAISE NOTICE '✅ Trigger disabled or does not exist. Webhooks will handle email notifications.';
  END IF;
END $$;

