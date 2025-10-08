# Push Notifications Implementation Guide

## Overview

StyleSnap uses the Web Push API to deliver real-time notifications to users on mobile, tablet, and desktop devices. Notifications are sent via VAPID protocol and managed through Supabase.

## Architecture

```
┌─────────────────┐
│   User Action   │
│  (like, friend) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Notification Trigger   │
│  (in app code)          │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  should_send_notification│
│  (check preferences)     │
└────────┬─────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Supabase Edge Function    │
│  send-push-notification    │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Push Service              │
│  (FCM, APNs, etc.)         │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Service Worker            │
│  (public/service-worker.js)│
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Browser Notification      │
│  (shown to user)           │
└────────────────────────────┘
```

## Database Tables

### `push_subscriptions`

Stores Web Push subscription details for each user device.

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  endpoint TEXT UNIQUE NOT NULL,           -- Push service endpoint
  p256dh TEXT NOT NULL,                    -- Encryption public key
  auth TEXT NOT NULL,                      -- Auth secret
  device_type VARCHAR(20),                 -- mobile, tablet, desktop
  browser VARCHAR(50),                     -- Chrome, Firefox, Safari
  os VARCHAR(50),                          -- iOS, Android, Windows, etc.
  is_active BOOLEAN DEFAULT TRUE,
  failed_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `notification_preferences`

User preferences for what notifications to receive.

```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  push_enabled BOOLEAN DEFAULT TRUE,
  friend_requests BOOLEAN DEFAULT TRUE,
  friend_accepted BOOLEAN DEFAULT TRUE,
  outfit_likes BOOLEAN DEFAULT TRUE,
  outfit_comments BOOLEAN DEFAULT TRUE,
  item_likes BOOLEAN DEFAULT TRUE,
  friend_outfit_suggestions BOOLEAN DEFAULT TRUE,
  daily_suggestions BOOLEAN DEFAULT FALSE,
  daily_suggestion_time TIME DEFAULT '08:00:00',
  weather_alerts BOOLEAN DEFAULT FALSE,
  quota_warnings BOOLEAN DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00'
);
```

### `notification_delivery_log`

Tracks push notification delivery status.

```sql
CREATE TABLE notification_delivery_log (
  id UUID PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES push_subscriptions(id),
  status VARCHAR(20),                      -- sent, delivered, failed, expired
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

## Setup Instructions

### 1. Generate VAPID Keys

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

Output:
```
Public Key: BKxYj...
Private Key: 4T1c...
```

### 2. Configure Environment Variables

Add to `.env`:

```env
# VAPID keys for push notifications
VITE_VAPID_PUBLIC_KEY=BKxYj...
VAPID_PRIVATE_KEY=4T1c...
VAPID_SUBJECT=mailto:support@stylesnap.app
```

**Note:** Only the public key is exposed to the client (VITE_ prefix). Private key stays server-side.

### 3. Deploy Edge Function

```bash
# Deploy the send-push-notification function
supabase functions deploy send-push-notification

# Set environment variables
supabase secrets set VAPID_PUBLIC_KEY=BKxYj...
supabase secrets set VAPID_PRIVATE_KEY=4T1c...
supabase secrets set VAPID_SUBJECT=mailto:support@stylesnap.app
```

### 4. Run Database Migration

```bash
# Run the push notifications migration
psql -h your-db-host -d your-db -f sql/010_push_notifications.sql
```

Or via Supabase dashboard:
1. Go to SQL Editor
2. Paste contents of `sql/010_push_notifications.sql`
3. Run migration

### 5. Update manifest.json

Ensure `public/manifest.json` has proper configuration:

```json
{
  "gcm_sender_id": "103953800507",
  "permissions": [
    "notifications"
  ]
}
```

## Usage

### Client-Side: Request Permission

```javascript
import { requestNotificationPermission } from '@/services/push-notifications'

// Request permission from user
const permission = await requestNotificationPermission()

if (permission === 'granted') {
  console.log('Notifications enabled!')
  // Subscription is automatically created and saved
}
```

### Client-Side: Manage Preferences

```vue
<template>
  <NotificationSettings />
</template>

<script setup>
import NotificationSettings from '@/components/notifications/NotificationSettings.vue'
</script>
```

### Server-Side: Send Notification

```javascript
import { supabase } from '@/config/supabase'

// Send push notification to user
const { data, error } = await supabase.functions.invoke('send-push-notification', {
  body: {
    user_id: 'uuid',
    type: 'outfit_like',
    title: 'New Like',
    body: 'Jane Doe liked your outfit',
    data: {
      outfit_id: 'uuid',
      liker_id: 'uuid',
      url: '/shared-outfits/uuid'
    },
    icon: '/icons/heart-icon.png'
  }
})
```

### Automatic Triggers

Notifications are automatically sent for these events:

```javascript
// After creating a friend request
await supabase.from('friends').insert({ /* ... */ })
// Trigger: send-push-notification automatically called

// After liking an outfit
await supabase.from('shared_outfit_likes').insert({ /* ... */ })
// Trigger: send-push-notification automatically called

// After commenting on outfit
await supabase.from('outfit_comments').insert({ /* ... */ })
// Trigger: send-push-notification automatically called
```

## Notification Types

### Friend Request

```javascript
{
  type: 'friend_request',
  title: 'New Friend Request',
  body: 'John Doe sent you a friend request',
  data: { friend_id: 'uuid' },
  requireInteraction: true
}
```

### Outfit Like

```javascript
{
  type: 'outfit_like',
  title: 'New Like',
  body: 'Jane Doe liked your outfit',
  data: { outfit_id: 'uuid', liker_id: 'uuid' }
}
```

### Friend Outfit Suggestion

```javascript
{
  type: 'friend_outfit_suggestion',
  title: 'Outfit Suggestion',
  body: 'Mike suggested an outfit for you',
  data: { suggestion_id: 'uuid', friend_id: 'uuid' },
  requireInteraction: true
}
```

## Testing

### Test Notification from Settings

```javascript
import { sendTestNotification } from '@/services/push-notifications'

// Send test notification
await sendTestNotification()
```

### Manual Test via Edge Function

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "uuid",
    "type": "outfit_like",
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {}
  }'
```

## Debugging

### Check Subscription Status

```javascript
import { isPushNotificationSupported, getNotificationPermission } from '@/services/push-notifications'

console.log('Supported:', isPushNotificationSupported())
console.log('Permission:', getNotificationPermission())

// Check active subscriptions in database
const { data } = await supabase
  .from('push_subscriptions')
  .select('*')
  .eq('is_active', true)

console.log('Active subscriptions:', data)
```

### View Delivery Logs

```sql
SELECT 
  ndl.*,
  n.type,
  n.message,
  ps.device_type,
  ps.browser
FROM notification_delivery_log ndl
JOIN notifications n ON n.id = ndl.notification_id
JOIN push_subscriptions ps ON ps.id = ndl.subscription_id
WHERE ndl.user_id = 'uuid'
ORDER BY ndl.sent_at DESC
LIMIT 50;
```

### Check Failed Subscriptions

```sql
SELECT *
FROM push_subscriptions
WHERE failed_count > 0
ORDER BY failed_count DESC;
```

## Maintenance

### Cleanup Expired Subscriptions

Run periodically (e.g., daily cron job):

```sql
SELECT cleanup_expired_push_subscriptions();
```

### Monitor Delivery Rates

```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'delivered')::NUMERIC / 
    COUNT(*)::NUMERIC * 100, 
    2
  ) as delivery_rate
FROM notification_delivery_log
WHERE sent_at > NOW() - INTERVAL '7 days';
```

Expected delivery rate: **> 95%**

## Security

### VAPID Keys
- **Public Key:** Embedded in client (safe to expose)
- **Private Key:** Server-only (Supabase secrets)
- Keys identify your application to push services

### Row Level Security
- All tables have RLS policies enabled
- Users can only view/modify their own subscriptions
- Edge function uses service role for sending

### Encryption
- Push content encrypted using `p256dh` and `auth` keys
- End-to-end encryption from server to client
- Only target device can decrypt notification

## Browser Support

| Browser | Push Support | Notes |
|---------|-------------|-------|
| Chrome | ✅ Yes | Full support |
| Firefox | ✅ Yes | Full support |
| Safari | ✅ Yes | iOS 16.4+ |
| Edge | ✅ Yes | Chromium-based |
| Opera | ✅ Yes | Chromium-based |

## Troubleshooting

### Notifications Not Appearing

1. Check permission status: `Notification.permission`
2. Verify service worker is registered and active
3. Check browser console for errors
4. Verify VAPID keys are correct
5. Check delivery logs for failures

### Permission Denied

Guide user to re-enable in browser settings:
1. Click lock icon in address bar
2. Find "Notifications" permission
3. Change to "Allow"
4. Reload page

### High Failure Rate

1. Check VAPID keys match
2. Verify subscriptions haven't expired
3. Check network connectivity
4. Review error messages in delivery logs

## Performance

- **Latency:** < 1 second from trigger to delivery
- **Delivery Rate:** > 95% success rate
- **Batch Size:** Support up to 100 devices per user
- **Retry Logic:** Automatic retry on temporary failures
- **Cleanup:** Auto-disable after 5 consecutive failures

## Future Enhancements

- [ ] Push notification analytics dashboard
- [ ] A/B testing for notification content
- [ ] Rich notifications with images
- [ ] Notification grouping/stacking
- [ ] Custom sounds per notification type
- [ ] Notification action buttons (e.g., "Like", "Reply")
- [ ] Schedule notifications for later delivery
- [ ] Rate limiting to prevent spam

## Resources

- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
