-- Migration 057: Recreate Email Notification Trigger
-- This recreates the trigger that was dropped
-- Date: January 2025

BEGIN;

-- Ensure the function exists (from migration 055 or 056)
-- If it doesn't exist, this will use the latest version
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'send_email_notification'
  ) THEN
    RAISE WARNING 'send_email_notification function does not exist. Please run migration 055 first.';
  END IF;
END $$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;
CREATE TRIGGER trigger_send_email_notification
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION send_email_notification();

COMMENT ON TRIGGER trigger_send_email_notification ON notifications IS 'Automatically sends email notification when new notification is created';

COMMIT;

-- Verify trigger exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_send_email_notification'
    AND event_object_table = 'notifications'
  ) THEN
    RAISE NOTICE '✅ Trigger trigger_send_email_notification recreated successfully';
  ELSE
    RAISE WARNING '⚠️  Trigger was not created. Check for errors above.';
  END IF;
END $$;

