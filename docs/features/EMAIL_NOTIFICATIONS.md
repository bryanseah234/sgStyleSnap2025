# Email Notifications System

## Overview

Automatic email notifications are now enabled for important events in StyleSnap. Users receive email alerts for friend requests, outfit likes, comments, and other social interactions.

## Features

✅ **Automatically sent** - No manual intervention required  
✅ **User preferences** - Users can disable emails via settings  
✅ **Type-specific control** - Granular preferences per notification type  
✅ **Status tracking** - Email delivery status tracked in database  
✅ **Error handling** - Failed emails logged for debugging  

## Notification Types with Email Support

| Type | Description | Email Subject |
|------|-------------|---------------|
| `friend_request` | Friend request received | "You received a friend request on StyleSnap" |
| `friend_request_accepted` | Friend request accepted | "Your friend request was accepted on StyleSnap" |
| `outfit_like` | Outfit liked by friend | "Someone liked your outfit on StyleSnap" |
| `item_like` | Closet item liked | "Someone liked your item on StyleSnap" |
| `outfit_shared` | Outfit shared with you | "A friend shared an outfit with you on StyleSnap" |
| `friend_outfit_suggestion` | Outfit suggestion received | "You have an outfit suggestion on StyleSnap" |
| `outfit_comment` | Comment on outfit | "New comment on your outfit on StyleSnap" |

## Architecture

```
Notification Created (DB Trigger)
    ↓
Edge Function: send-email-notification
    ↓
Check User Preferences
    ↓
Get User Email & Actor Name
    ↓
Select Email Template
    ↓
Send via Brevo API
    ↓
Update Notification Status
```

## Database Schema

### Email Status Columns (notifications table)

- `email_status` - `NULL` (not attempted), `'email_sent'`, `'email_error'`
- `email_sent_at` - Timestamp when email was successfully sent
- `email_error` - Error message if email sending failed

### Email Preferences (notification_preferences table)

- `email_enabled` - `BOOLEAN DEFAULT TRUE` - Master switch for email notifications

## Deployment

### 1. Deploy Edge Function

```bash
supabase functions deploy send-email-notification --no-verify-jwt
```

### 2. Set Environment Variables

In Supabase Dashboard → Edge Functions → Settings:

```env
BREVO_API_KEY=your_brevo_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Migration

```bash
psql -h your-db-host -U postgres -d postgres -f database/migrations/050_email_notifications.sql
```

Or via Supabase Dashboard → SQL Editor → Run migration SQL

### 4. Configure Database Settings (Optional)

If using pg_net triggers, set these in your database:

```sql
ALTER DATABASE your_database SET app.settings.supabase_url = 'https://your-project.supabase.co';
ALTER DATABASE your_database SET app.settings.supabase_service_key = 'your_service_key';
```

### 5. Alternative: Webhook Configuration

If pg_net triggers don't work, use Supabase webhooks:

1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhook:
   - Table: `notifications`
   - Events: `INSERT`
   - URL: `https://YOUR_PROJECT.functions.supabase.co/functions/v1/send-email-notification`
   - HTTP Method: `POST`
   - HTTP Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
3. Disable the database trigger:
   ```sql
   DROP TRIGGER IF EXISTS trigger_send_email_notification ON notifications;
   ```

## User Preferences

Users can control email notifications via their notification preferences:

```sql
-- Disable all email notifications
UPDATE notification_preferences
SET email_enabled = FALSE
WHERE user_id = 'user-uuid';

-- Disable specific notification types (still controlled by type-specific prefs)
UPDATE notification_preferences
SET friend_requests = FALSE  -- Will also disable email for friend requests
WHERE user_id = 'user-uuid';
```

## Email Templates

Email templates are defined in the Edge Function (`supabase/functions/send-email-notification/index.ts`). Each template includes:

- Subject line
- HTML body with styling
- Actor name (who triggered the notification)
- Call-to-action (open app)

### Customizing Templates

Edit `supabase/functions/send-email-notification/index.ts`:

```typescript
function getEmailTemplate(notificationType: string, actorName: string): EmailTemplate | null {
  const templates: Record<string, EmailTemplate> = {
    friend_request: {
      subject: 'Your custom subject',
      html: 'Your custom HTML template'
    },
    // ... other templates
  }
}
```

## Testing

### Test Email Sending

1. Create a test notification:
   ```sql
   INSERT INTO notifications (recipient_id, type, reference_id)
   VALUES ('user-uuid', 'friend_request', 'test-id');
   ```

2. Check email status:
   ```sql
   SELECT id, type, email_status, email_sent_at, email_error
   FROM notifications
   WHERE id = 'notification-id';
   ```

3. Check Edge Function logs:
   - Supabase Dashboard → Edge Functions → Logs

### Test User Preferences

```sql
-- Disable emails for a user
UPDATE notification_preferences
SET email_enabled = FALSE
WHERE user_id = 'test-user-uuid';

-- Create notification (should not send email)
INSERT INTO notifications (recipient_id, type, reference_id)
VALUES ('test-user-uuid', 'friend_request', 'test-id');

-- Check that email_status is NULL or skipped
```

## Monitoring

### Check Email Delivery Status

```sql
-- Successful emails
SELECT COUNT(*), type
FROM notifications
WHERE email_status = 'email_sent'
GROUP BY type;

-- Failed emails
SELECT id, type, email_error, created_at
FROM notifications
WHERE email_status = 'email_error'
ORDER BY created_at DESC
LIMIT 20;

-- Notifications without email attempt
SELECT COUNT(*), type
FROM notifications
WHERE email_status IS NULL
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY type;
```

### Edge Function Metrics

- Supabase Dashboard → Edge Functions → Metrics
- View request count, success rate, latency, errors

## Troubleshooting

### Emails Not Sending

1. **Check Edge Function deployment:**
   ```bash
   supabase functions list
   ```

2. **Check BREVO_API_KEY:**
   - Verify key is set in Edge Function secrets
   - Test key validity in Brevo dashboard

3. **Check database trigger:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_send_email_notification';
   ```

4. **Check email status:**
   ```sql
   SELECT email_status, email_error, created_at
   FROM notifications
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC;
   ```

5. **Check user preferences:**
   ```sql
   SELECT user_id, email_enabled
   FROM notification_preferences
   WHERE user_id = 'target-user-uuid';
   ```

### Edge Function Errors

Check Supabase Dashboard → Edge Functions → Logs for:
- Authentication errors (missing service key)
- Brevo API errors (invalid API key, rate limits)
- Missing user data (no email address)
- Template errors (unsupported notification type)

## Rate Limits

Brevo free tier limits:
- 300 emails/day
- Monitor usage in Brevo dashboard

For higher volumes, upgrade Brevo plan or implement:
- Email batching
- Priority queue (urgent vs. non-urgent)
- Rate limiting

## Future Enhancements

- [ ] Email digest (daily/weekly summary)
- [ ] Unsubscribe links in emails
- [ ] Email preference UI in app
- [ ] A/B testing for email templates
- [ ] Email analytics dashboard
- [ ] Retry mechanism for failed sends
- [ ] HTML email preview in settings

## Related Documentation

- [Notification System](./FRIEND_NOTIFICATIONS.md)
- [Edge Functions Deployment](../../deployment/MODEL_DEPLOYMENT_GUIDE.md)
- [Brevo API Documentation](https://developers.brevo.com/)

