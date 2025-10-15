-- Temporarily disable auto-contribution to catalog to fix RLS error
-- Run this if you can't add the INSERT policy right now

-- Drop the trigger that auto-contributes to catalog
DROP TRIGGER IF EXISTS auto_contribute_to_catalog_trigger ON clothes;

-- You can re-enable it later by running:
-- CREATE TRIGGER auto_contribute_to_catalog_trigger
--   AFTER INSERT ON clothes
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_contribute_to_catalog();
