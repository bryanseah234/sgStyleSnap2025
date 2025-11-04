-- Migration 059: Ensure Email Trigger is Disabled
-- This checks and removes any existing email notification triggers
-- Date: January 2025

BEGIN;

-- Check what triggers exist on notifications table
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  RAISE NOTICE 'Checking for triggers on notifications table...';
  FOR trigger_rec IN
    SELECT trigger_name, event_manipulation, action_timing
    FROM information_schema.triggers
    WHERE event_object_table = 'notifications'
  LOOP
    RAISE NOTICE 'Found trigger: % (event: %, timing: %)', trigger_rec.trigger_name, trigger_rec.event_manipulation, trigger_rec.action_timing;
  END LOOP;
END $$;

-- Drop the trigger if it exists (try multiple times to be sure)
DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications CASCADE;

-- Also try dropping with different possible names
DROP TRIGGER IF EXISTS send_email_notification_trigger ON notifications CASCADE;
DROP TRIGGER IF EXISTS email_notification_trigger ON notifications CASCADE;

-- Verify trigger is gone
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name LIKE '%email%' 
    AND event_object_table = 'notifications'
  ) THEN
    RAISE WARNING '⚠️  Email-related trigger still exists! Check the list above.';
  ELSE
    RAISE NOTICE '✅ All email triggers removed. Webhooks will handle email notifications.';
  END IF;
END $$;

COMMIT;

