# 🧹 Notification Cleanup System Guide

## Overview

StyleSnap implements a **7-day notification retention policy** to manage database growth and improve performance. This system automatically cleans up old notifications while preserving important user interactions.

## 🎯 Key Features

### **7-Day Retention Policy**
- ✅ **All notifications expire after 7 days** from creation
- ✅ **Status transitions extend expiry** for accepted/rejected notifications
- ✅ **Automatic cleanup** removes expired notifications
- ✅ **Database optimization** with proper indexing

### **Notification Lifecycle**
1. **Created** → Status: `pending`, Expires: 7 days
2. **User Action** → Status: `accepted`/`rejected`, Expires: +7 days (14 total)
3. **Expired** → Automatically deleted from database

## 📊 Notification Types & Behavior

### **Friend Requests**
- **Pending**: Shows for 7 days, user can accept/reject
- **Accepted**: Shows for additional 7 days, then deleted
- **Rejected**: Shows for additional 7 days, then deleted
- **Expired**: Deleted, friendship status remains in database

### **Outfit Suggestions**
- **Pending**: Shows for 7 days, user can approve/reject
- **Approved**: Shows for additional 7 days, outfit saved to closet
- **Rejected**: Shows for additional 7 days, then deleted
- **Expired**: Deleted, approved outfits remain in closet

### **Likes & Comments**
- **Created**: Shows for 7 days
- **Expired**: Automatically deleted

## 🛠️ Technical Implementation

### **Database Schema Updates**

```sql
-- New columns added to notifications table
ALTER TABLE notifications 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'));

ALTER TABLE notifications 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE 
DEFAULT (NOW() + INTERVAL '7 days');
```

### **Key Database Functions**

1. **`cleanup_expired_notifications()`** - Deletes notifications older than 7 days
2. **`update_notification_status()`** - Updates status and extends expiry
3. **`get_user_notifications_with_retention()`** - Gets notifications within retention period
4. **`get_unread_notifications_count()`** - Counts unread notifications within retention

### **Service Layer Updates**

- **`notificationsService.getNotifications()`** - Now respects 7-day retention
- **`notificationsService.updateNotificationStatus()`** - Handles status transitions
- **`notificationsService.cleanupExpiredNotifications()`** - Admin cleanup function

## 🚀 Usage

### **Manual Cleanup**

```bash
# Preview what would be deleted (dry run)
npm run cleanup-notifications -- --dry-run

# Show detailed information
npm run cleanup-notifications -- --verbose

# Actually perform cleanup
npm run cleanup-notifications
```

### **Programmatic Cleanup**

```javascript
import { notificationsService } from './services/notifications-service'

// Clean up expired notifications
const result = await notificationsService.cleanupExpiredNotifications()
console.log(`Deleted ${result.deleted_count} notifications`)
```

### **Status Updates**

```javascript
// When user accepts a friend request
await notificationsService.updateNotificationStatus(
  notificationId, 
  'accepted'  // Extends expiry by 7 days
)

// When user rejects an outfit suggestion
await notificationsService.updateNotificationStatus(
  notificationId, 
  'rejected'  // Extends expiry by 7 days
)
```

## 📅 Automated Cleanup

### **Recommended Schedule**

- **Daily cleanup**: Remove expired notifications
- **Weekly monitoring**: Check cleanup statistics
- **Monthly review**: Analyze notification patterns

### **Cron Job Example**

```bash
# Daily at 2 AM
0 2 * * * cd /path/to/stylesnap && npm run cleanup-notifications
```

### **GitHub Actions Example**

```yaml
name: Daily Notification Cleanup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Cleanup notifications
        run: npm run cleanup-notifications
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## 📊 Monitoring & Analytics

### **Cleanup Statistics**

The cleanup script provides detailed statistics:

```
📊 Notification Statistics:
   Total notifications: 1,234
   Active (within 7 days): 456
   Expired (older than 7 days): 778
   Expired by status:
     pending: 234
     accepted: 345
     rejected: 199
```

### **Database Monitoring**

Monitor these metrics:
- **Notification growth rate**
- **Cleanup frequency**
- **Storage usage**
- **Query performance**

## 🔧 Configuration

### **Environment Variables**

```bash
# Required for cleanup script
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Retention Period**

To change the retention period, update the database migration:

```sql
-- Change from 7 days to 14 days
ALTER TABLE notifications 
ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '14 days');
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Cleanup not running**
   - Check environment variables
   - Verify database permissions
   - Check cron job configuration

2. **Notifications not expiring**
   - Verify database triggers are active
   - Check `expires_at` column values
   - Run manual cleanup to test

3. **Performance issues**
   - Ensure indexes are created
   - Monitor query execution times
   - Consider batch cleanup for large datasets

### **Debug Commands**

```bash
# Check notification statistics
npm run cleanup-notifications -- --dry-run --verbose

# Test database functions
psql -d your_database -c "SELECT cleanup_expired_notifications();"

# Check indexes
psql -d your_database -c "\d+ notifications"
```

## 📈 Benefits

### **Performance**
- ✅ **Faster queries** - Smaller notification table
- ✅ **Reduced storage** - Automatic cleanup
- ✅ **Better indexing** - Optimized for active notifications

### **User Experience**
- ✅ **Clean interface** - Only relevant notifications shown
- ✅ **Consistent behavior** - Predictable notification lifecycle
- ✅ **No data loss** - Important actions preserved (friendships, outfits)

### **Maintenance**
- ✅ **Automated cleanup** - No manual intervention required
- ✅ **Monitoring tools** - Built-in statistics and logging
- ✅ **Flexible configuration** - Easy to adjust retention periods

## 🔄 Migration Guide

### **Existing Notifications**

When deploying this system:

1. **Run migration** to add new columns
2. **Update existing notifications** with proper expiry dates
3. **Deploy updated services** with retention logic
4. **Set up automated cleanup** schedule

### **Backward Compatibility**

- ✅ **Existing notifications** get default 7-day expiry
- ✅ **Old API calls** continue to work
- ✅ **Gradual migration** - no breaking changes

---

## 📚 Related Documentation

- [Notifications Guide](./NOTIFICATIONS_GUIDE.md) - Complete notification system
- [Database Guide](./DATABASE_GUIDE.md) - Database schema and functions
- [API Guide](../api/API_GUIDE.md) - Service layer documentation
- [Maintenance Guide](./MAINTENANCE_GUIDE.md) - General maintenance tasks
