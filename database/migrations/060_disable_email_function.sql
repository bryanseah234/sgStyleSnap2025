-- Migration 060: Disable send_email_notification Function
-- Since webhooks are handling emails and pg_net is not working,
-- disable the function to prevent errors
-- Date: January 2025

BEGIN;

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

COMMENT ON FUNCTION send_email_notification() IS 'DISABLED: Using Supabase webhooks instead. This function is a no-op.';

COMMIT;

-- Verify function exists but does nothing
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'send_email_notification'
  ) THEN
    RAISE NOTICE '✅ Function send_email_notification disabled (no-op version). Webhooks handle emails.';
  ELSE
    RAISE WARNING '⚠️  Function does not exist';
  END IF;
END $$;

