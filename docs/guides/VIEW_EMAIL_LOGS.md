# How to View Email Notification Logs

## 1. Supabase Dashboard (Easiest Method)

### View Edge Function Logs
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to: **Edge Functions** → **send-email-notification** → **Logs**
3. You'll see real-time logs with:
   - ✅ Success messages: `Email sent successfully`
   - ❌ Error messages: `Brevo API error`, `Recipient user not found`, etc.
   - ⚠️ Warnings: `Email skipped due to user preferences`

### What to Look For
- **Success indicators:**
  - `Email sent successfully`
  - `Email status updated to email_sent`
  
- **Error indicators:**
  - `Error in send-email-notification: [error details]`
  - `Brevo API error: [error details]`
  - `Recipient user not found or has no email`
  - `Error checking email preferences: [error details]`

## 2. Database Query (Check Notification Status)

Run this SQL query in Supabase Dashboard → SQL Editor:

```sql
-- View recent notifications and their email status
SELECT 
  id,
  type,
  recipient_id,
  email_status,
  email_sent_at,
  email_error,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 20;
```

**Status meanings:**
- `email_sent` = Email was sent successfully ✅
- `email_error` = Email failed (check `email_error` field for details) ❌
- `NULL` = Email not yet processed or trigger didn't fire ⏳

## 3. Check Specific Notification Errors

```sql
-- Find notifications with errors
SELECT 
  id,
  type,
  recipient_id,
  email_status,
  email_error,
  created_at
FROM notifications
WHERE email_status = 'email_error'
ORDER BY created_at DESC
LIMIT 10;
```

## 4. View via Supabase CLI

If you have the Supabase CLI installed:

```bash
# View logs for the Edge Function
supabase functions logs send-email-notification --project-ref YOUR_PROJECT_REF

# Follow logs in real-time
supabase functions logs send-email-notification --project-ref YOUR_PROJECT_REF --follow
```

## 5. Test Email Sending Manually

Test the Edge Function directly to see logs:

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

Then check the logs in the Dashboard immediately after.

## Common Error Messages

| Error Message | Meaning | Fix |
|--------------|---------|-----|
| `Brevo API error` | Invalid or missing BREVO_API_KEY | Check Edge Function secrets |
| `Recipient user not found or has no email` | User missing from database or no email | Verify user exists and has email |
| `Email skipped due to user preferences` | User disabled email notifications | Check `notification_preferences` table |
| `Missing required fields` | Invalid request payload | Check notification data structure |
| `Error checking email preferences` | Database query failed | Check database connection/permissions |

## Debug Steps

1. **Check Edge Function is deployed:**
   ```bash
   supabase functions list
   ```

2. **Check environment variables:**
   - Dashboard → Edge Functions → Settings → Secrets
   - Ensure `BREVO_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` are set

3. **Check trigger is active:**
   ```sql
   SELECT tgname, tgenabled 
   FROM pg_trigger 
   WHERE tgname = 'trigger_send_email_notification';
   ```

4. **Test with a manual notification:**
   ```sql
   INSERT INTO notifications (recipient_id, type, reference_id)
   VALUES ('your-user-id', 'friend_request', 'test-123')
   RETURNING id, email_status;
   
   -- Wait 5 seconds, then check
   SELECT email_status, email_error FROM notifications WHERE id = 'test-123';
   ```

## Real-Time Monitoring

For production monitoring, consider:
- Setting up alerts in Supabase Dashboard for Edge Function errors
- Using Supabase's built-in monitoring features
- Checking Brevo dashboard for email delivery status

