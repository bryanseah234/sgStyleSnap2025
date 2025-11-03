# Email Notifications Diagnostic Checklist

## Quick Verification Steps

### 1. Check Edge Function Deployment

```bash
# List deployed functions
supabase functions list

# Check if send-email-notification is deployed
# Should see: send-email-notification | active
```

**If not deployed:**
```bash
supabase functions deploy send-email-notification --no-verify-jwt
```

### 2. Verify Environment Variables

Check Supabase Dashboard → Edge Functions → Settings → Secrets:

**Required:**
- `BREVO_API_KEY` - Your Brevo/Sendinblue API key
- `SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (not anon key!)

**To set via CLI:**
```bash
supabase secrets set BREVO_API_KEY="your-key" --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_URL="https://xxxxx.supabase.co" --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-key" --project-ref YOUR_PROJECT_REF
```

### 3. Check Database Trigger

```sql
-- Check if trigger exists
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname = 'trigger_send_email_notification';

-- Should return one row with tgenabled = 'O' (enabled)
```

**If trigger doesn't exist, run migration:**
```sql
-- Run this from database/migrations/050_email_notifications.sql
```

### 4. Check pg_net Extension

```sql
-- Check if pg_net is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- If not enabled, enable it:
CREATE EXTENSION IF NOT EXISTS pg_net;
```

**Note:** If pg_net is not available, use webhooks instead (see step 7).

### 5. Verify Database Configuration (for pg_net triggers)

```sql
-- Check if Supabase URL is configured
SELECT current_setting('app.settings.supabase_url', true);

-- If NULL, set it:
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'your-service-key';
```

### 6. Test Email Sending Manually

**Option A: Test via Edge Function directly**

```bash
curl -X POST 'https://YOUR_PROJECT.functions.supabase.co/functions/v1/send-email-notification' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "test-123",
    "recipient_id": "user-uuid-here",
    "type": "friend_request",
    "actor_id": "actor-uuid-here"
  }'
```

**Option B: Check notification email status**

```sql
-- Create a test notification
INSERT INTO notifications (recipient_id, type, reference_id)
VALUES ('user-uuid-here', 'friend_request', 'test-123')
RETURNING id, email_status, email_error;

-- Wait a few seconds, then check status
SELECT id, type, email_status, email_sent_at, email_error, created_at
FROM notifications
WHERE id = 'test-123';
```

**Expected results:**
- `email_status` should become `'email_sent'` within a few seconds
- `email_sent_at` should be populated
- If `email_status` is `'email_error'`, check `email_error` field

### 7. Alternative: Use Webhooks (Recommended if pg_net fails)

If database triggers don't work reliably, use Supabase webhooks:

1. **Go to:** Supabase Dashboard → Database → Webhooks
2. **Create new webhook:**
   - **Name:** `send-email-notification`
   - **Table:** `notifications`
   - **Events:** `INSERT` only
   - **URL:** `https://YOUR_PROJECT.functions.supabase.co/functions/v1/send-email-notification`
   - **HTTP Method:** `POST`
   - **HTTP Headers:** 
     ```
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     Content-Type: application/json
     ```
   - **Payload:** Select all fields (or custom JSON payload)
3. **Disable database trigger:**
   ```sql
   DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;
   ```

### 8. Check User Email Preferences

```sql
-- Check if user has email notifications enabled
SELECT user_id, email_enabled, friend_requests, outfit_likes
FROM notification_preferences
WHERE user_id = 'user-uuid-here';

-- Email will be skipped if email_enabled = FALSE
```

### 9. Verify User Has Email Address

```sql
-- Check if user has an email
SELECT id, email, name
FROM users
WHERE id = 'user-uuid-here';

-- Email won't send if email is NULL
```

### 10. Check Edge Function Logs

**Go to:** Supabase Dashboard → Edge Functions → `send-email-notification` → Logs

Look for:
- ✅ `Email sent successfully` - Working!
- ❌ `Brevo API error` - Check BREVO_API_KEY
- ❌ `Recipient user not found or has no email` - User missing email
- ❌ `Email skipped due to user preferences` - User disabled emails

## Common Issues & Fixes

### Issue: `email_status` is always NULL

**Causes:**
1. Database trigger not firing
2. Edge Function not being called
3. pg_net extension not enabled

**Fix:**
- Check trigger exists (step 3)
- Enable pg_net or use webhooks (step 7)
- Check database logs for trigger errors

### Issue: `email_status` is `'email_error'`

**Causes:**
1. Invalid BREVO_API_KEY
2. Brevo API rate limit exceeded
3. Invalid recipient email

**Fix:**
- Verify BREVO_API_KEY in Edge Function secrets
- Check Brevo dashboard for API usage/errors
- Verify user has valid email address

### Issue: Edge Function returns 404

**Causes:**
1. Function not deployed
2. Wrong URL

**Fix:**
- Deploy function: `supabase functions deploy send-email-notification`
- Verify URL matches your project reference

### Issue: Edge Function returns 500

**Causes:**
1. Missing environment variables
2. Invalid service role key
3. Brevo API errors

**Fix:**
- Check Edge Function logs for specific error
- Verify all required secrets are set (step 2)
- Test BREVO_API_KEY in Brevo dashboard

## Quick Test Script

Run this SQL to create a test notification and check email status:

```sql
-- 1. Get a test user ID
SELECT id, email FROM users LIMIT 1;

-- 2. Create test notification (replace USER_ID with actual user ID)
INSERT INTO notifications (recipient_id, type, reference_id, actor_id)
VALUES (
  'USER_ID_HERE',
  'friend_request',
  'test-' || gen_random_uuid()::text,
  (SELECT id FROM users LIMIT 1)
)
RETURNING id, type, email_status;

-- 3. Wait 5 seconds, then check status
SELECT 
  id,
  type,
  email_status,
  email_sent_at,
  email_error,
  created_at
FROM notifications
WHERE reference_id LIKE 'test-%'
ORDER BY created_at DESC
LIMIT 5;
```

## Success Indicators

✅ **Email notifications are working if:**
- `email_status` = `'email_sent'` within 5-10 seconds
- `email_sent_at` is populated
- Email appears in recipient's inbox
- Edge Function logs show success

❌ **Email notifications are NOT working if:**
- `email_status` stays NULL after 30 seconds
- `email_status` = `'email_error'` with error message
- Edge Function logs show errors
- No email received

## Next Steps

If emails are still not working after checking all items above:

1. Check Brevo dashboard for API usage/errors
2. Review Edge Function logs for detailed error messages
3. Test Edge Function directly with curl (step 6)
4. Consider using webhooks instead of triggers (step 7)

