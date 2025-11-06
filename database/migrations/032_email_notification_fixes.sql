-- ============================================
-- Migration 032: Email Notification Fixes and Disable
-- ============================================
-- Purpose: Fixes and optional disable of email notification triggers (use webhooks instead)
-- Dependencies: 026_email_notifications.sql
-- Creates: None
-- Modifies:
--   - send_email_notification() function (makes it a no-op if disabling)
--   - Removes trigger_send_email_notification trigger
-- 
-- IMPORTANT: Run migrations in sequential order!
-- NOTE: This migration disables database triggers and recommends using Supabase webhooks instead.
-- ============================================

-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- STEP 1: CHECK FOR EXISTING TRIGGERS
-- ============================================

DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  RAISE NOTICE 'Checking for email-related triggers on notifications table...';
  FOR trigger_rec IN
    SELECT trigger_name, event_manipulation, action_timing
    FROM information_schema.triggers
    WHERE event_object_table = 'notifications'
    AND trigger_name LIKE '%email%'
  LOOP
    RAISE NOTICE 'Found trigger: % (event: %, timing: %)', trigger_rec.trigger_name, trigger_rec.event_manipulation, trigger_rec.action_timing;
  END LOOP;
END $$;

-- ============================================
-- STEP 2: DISABLE/REMOVE TRIGGERS
-- ============================================

-- Drop all email-related triggers (use webhooks instead)
DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications CASCADE;
DROP TRIGGER IF EXISTS send_email_notification_trigger ON notifications CASCADE;
DROP TRIGGER IF EXISTS email_notification_trigger ON notifications CASCADE;

-- ============================================
-- STEP 3: REPLACE FUNCTION WITH NO-OP VERSION
-- ============================================

-- Replace the function with a no-op version that does nothing
-- This prevents errors if it's somehow still being called
CREATE OR REPLACE FUNCTION send_email_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- No-op: webhooks handle email notifications now
  -- This function is kept for compatibility but does nothing
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION send_email_notification() IS 'DISABLED: Using Supabase webhooks instead. This function is a no-op for compatibility.';

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify triggers are removed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_table = 'notifications'
    AND trigger_name LIKE '%email%'
  ) THEN
    RAISE WARNING '⚠️ Email-related trigger still exists! Check the list above.';
  ELSE
    RAISE NOTICE '✅ All email triggers removed. Webhooks will handle email notifications.';
  END IF;
END $$;

-- Verify function exists but is no-op
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'send_email_notification'
  ) THEN
    RAISE NOTICE '✅ Function send_email_notification disabled (no-op version). Webhooks handle emails.';
  ELSE
    RAISE WARNING '⚠️ Function does not exist';
  END IF;
END $$;

-- ============================================
-- WEBHOOK SETUP INSTRUCTIONS
-- ============================================
-- 
-- After running this migration, set up Supabase webhooks:
-- 
-- 1. Go to Supabase Dashboard → Database → Webhooks
-- 
-- 2. Create new webhook:
--    - Table: notifications
--    - Events: INSERT
--    - Type: HTTP Request
--    - URL: https://YOUR_PROJECT.functions.supabase.co/functions/v1/send-email-notification
--    - HTTP Method: POST
--    - HTTP Headers:
--      - Content-Type: application/json
--      - Authorization: Bearer YOUR_SERVICE_ROLE_KEY
--      - apikey: YOUR_SERVICE_ROLE_KEY
-- 
-- 3. Webhook Payload Template:
--    {
--      "id": "{{ NOTIFICATION.id }}",
--      "recipient_id": "{{ NOTIFICATION.recipient_id }}",
--      "actor_id": "{{ NOTIFICATION.actor_id }}",
--      "type": "{{ NOTIFICATION.type }}",
--      "reference_id": "{{ NOTIFICATION.reference_id }}",
--      "message": "{{ NOTIFICATION.custom_message }}",
--      "created_at": "{{ NOTIFICATION.created_at }}"
--    }
-- 
-- 4. Test the webhook by creating a test notification
-- 
-- Benefits of webhooks over triggers:
-- - More reliable (not dependent on pg_net extension)
-- - Better error handling and retry logic
-- - Easier to debug and monitor
-- - Works even if triggers fail

