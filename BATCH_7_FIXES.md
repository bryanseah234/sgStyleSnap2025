# BATCH 7 FIXES: Quotas & Maintenance Issues

**Status:** ✅ COMPLETED  
**Date:** October 5, 2025  
**Files Modified:** 1  
**Issues Resolved:** 4 (+ Rate Limiting already fixed in Batch 6)

---

## Overview

This batch addresses critical quota management, maintenance automation, and storage optimization. These fixes ensure the app operates within free tier limits while providing excellent user experience with clear quota feedback and automatic cleanup processes.

---

## Issues Fixed

### Issue #51: Missing Quota Enforcement Implementation

**Severity:** CRITICAL  
**Category:** Business Logic  
**File:** `requirements/api-endpoints.md`

**Problem:**
- Generic "check quota" business logic without implementation details
- No middleware for quota enforcement
- Missing quota headers for client awareness
- No quota dashboard endpoint
- Unclear error responses for quota violations

**Solution:**
Added comprehensive quota enforcement system with:

1. **Quota Check Middleware** with database function integration
2. **Quota Headers** (X-Quota-Used, X-Quota-Limit, X-Quota-Remaining)
3. **Clear Error Responses** with friendly messages and actionable details
4. **GET /quota Endpoint** for dashboard with warnings and breakdowns
5. **Client-Side Quota UI** with progress bars and warnings at 90%/95%/100%

**Key Implementation:**

```javascript
// middleware/quotaCheck.js
export async function checkQuotaMiddleware(req, res, next) {
  const userId = req.user.id;
  
  try {
    // Use database function for accurate count
    const { data, error } = await supabase
      .rpc('check_item_quota', { user_id: userId });
    
    if (error) throw error;
    
    const currentCount = data;
    const limit = 200;
    
    // Set quota headers for client awareness
    res.setHeader('X-Quota-Used', currentCount);
    res.setHeader('X-Quota-Limit', limit);
    res.setHeader('X-Quota-Remaining', Math.max(0, limit - currentCount));
    
    if (currentCount >= limit) {
      return res.status(403).json({
        error: "You've reached your 200 item limit. Please remove some items to add new ones.",
        code: 'QUOTA_EXCEEDED',
        details: {
          current: currentCount,
          limit: limit,
          remaining: 0
        },
        timestamp: new Date().toISOString()
      });
    }
    
    req.quota = { current: currentCount, limit, remaining: limit - currentCount };
    next();
    
  } catch (error) {
    console.error('Quota check failed:', error);
    // Fail open - allow request if quota check fails
    next();
  }
}
```

**GET /quota Endpoint Response:**

```json
{
  "quota": {
    "used": 150,
    "limit": 200,
    "remaining": 50,
    "percentage": 75.0
  },
  "breakdown": {
    "active_items": 150,
    "trash_items": 8,
    "trash_recoverable": 5
  },
  "warnings": [
    {
      "type": "approaching_limit",
      "message": "You're at 75% capacity. Consider removing unused items.",
      "threshold": 180
    }
  ]
}
```

**Client-Side Quota Dashboard:**

```vue
<!-- components/QuotaIndicator.vue -->
<template>
  <div class="quota-dashboard">
    <div class="quota-header">
      <h3>Storage Quota</h3>
      <span class="quota-badge" :class="quotaStatus">
        {{ quota.used }}/{{ quota.limit }}
      </span>
    </div>
    
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${quota.percentage}%` }"
        :class="quotaStatus"
      />
    </div>
    
    <div v-if="warnings.length" class="warnings">
      <div v-for="warning in warnings" :key="warning.type" class="warning">
        ⚠️ {{ warning.message }}
      </div>
    </div>
  </div>
</template>
```

**Benefits:**
- Prevents over-quota uploads with accurate database counts
- Provides real-time quota feedback to users
- Shows warnings at 90% (180 items) and 95% (190 items)
- Client can proactively block uploads at 100%
- Detailed breakdown helps users manage their closet

---

### Issue #52: Soft Delete Recovery Not Documented

**Severity:** HIGH  
**Category:** Data Management  
**File:** `requirements/api-endpoints.md`

**Problem:**
- Soft delete recovery endpoints existed but lacked implementation details
- No 30-day expiration enforcement
- Missing quota validation on restore
- No trash management UI patterns
- Unclear recovery window messaging

**Solution:**
Enhanced soft delete recovery system:

1. **POST /clothes/:id/restore** with quota validation
2. **GET /clothes/trash** filtered to 30-day window
3. **Clear recovery deadline messaging** in removal response
4. **Quota check before restore** prevents exceeding limit
5. **Trash management UI** with countdown timers

**Enhanced Restore Endpoint:**

```javascript
// POST /clothes/:id/restore
app.post('/api/clothes/:id/restore', authenticate, async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.id;
  
  try {
    // Get the item
    const { data: item, error: fetchError } = await supabase
      .from('clothes')
      .select('*')
      .eq('id', itemId)
      .eq('owner_id', userId)
      .single();
    
    if (fetchError || !item) {
      return res.status(404).json({
        error: 'Item not found',
        code: 'NOT_FOUND'
      });
    }
    
    // Check if item is actually deleted
    if (!item.removed_at) {
      return res.status(400).json({
        error: 'Item is not in trash',
        code: 'NOT_DELETED'
      });
    }
    
    // Check if within 30-day recovery window
    const removedDate = new Date(item.removed_at);
    const daysSinceRemoval = (Date.now() - removedDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceRemoval > 30) {
      return res.status(404).json({
        error: 'Recovery period expired (30 days)',
        code: 'RECOVERY_EXPIRED',
        details: {
          removed_at: item.removed_at,
          days_since_removal: Math.floor(daysSinceRemoval)
        }
      });
    }
    
    // Check quota before restoring
    const { data: quotaCount } = await supabase
      .rpc('check_item_quota', { user_id: userId });
    
    if (quotaCount >= 200) {
      return res.status(403).json({
        error: "Cannot restore - you've reached your 200 item limit",
        code: 'QUOTA_EXCEEDED',
        details: {
          current: quotaCount,
          limit: 200,
          action: 'Remove some items before restoring'
        }
      });
    }
    
    // Restore the item
    const { data: restored, error: restoreError } = await supabase
      .from('clothes')
      .update({ removed_at: null })
      .eq('id', itemId)
      .select()
      .single();
    
    if (restoreError) throw restoreError;
    
    res.json({
      message: 'Item restored successfully',
      item: restored
    });
    
  } catch (error) {
    console.error('Restore failed:', error);
    res.status(500).json({
      error: 'Failed to restore item',
      code: 'RESTORE_FAILED'
    });
  }
});
```

**Trash Management UI:**

```vue
<!-- pages/Trash.vue -->
<template>
  <div class="trash-page">
    <h2>Trash ({{ trashItems.length }} items)</h2>
    <p class="info">Items are permanently deleted after 30 days</p>
    
    <div v-for="item in trashItems" :key="item.id" class="trash-item">
      <img :src="item.thumbnail_url" :alt="item.name" />
      <div class="item-info">
        <h3>{{ item.name }}</h3>
        <p class="expiry-warning" :class="getExpiryClass(item.removed_at)">
          {{ getExpiryMessage(item.removed_at) }}
        </p>
      </div>
      <button @click="restoreItem(item.id)">Restore</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

function getExpiryMessage(removedAt) {
  const removedDate = new Date(removedAt);
  const daysRemaining = 30 - Math.floor((Date.now() - removedDate) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 1) {
    return '⚠️ Deletes tomorrow';
  } else if (daysRemaining <= 7) {
    return `Deletes in ${daysRemaining} days`;
  } else {
    return `Recoverable for ${daysRemaining} days`;
  }
}

function getExpiryClass(removedAt) {
  const removedDate = new Date(removedAt);
  const daysRemaining = 30 - Math.floor((Date.now() - removedDate) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 3) return 'urgent';
  if (daysRemaining <= 7) return 'warning';
  return 'normal';
}
</script>
```

**Benefits:**
- Users can recover accidentally deleted items
- Clear 30-day deadline prevents confusion
- Quota validation prevents unexpected errors
- Visual countdown creates urgency for important items
- Automatic expiration keeps database clean

---

### Issue #53: No Automated Cleanup Process

**Severity:** CRITICAL  
**Category:** Maintenance  
**File:** `requirements/api-endpoints.md`

**Problem:**
- No automated purge of 30-day-old deleted items
- Manual Cloudinary cleanup required
- No logging of maintenance operations
- No monitoring of cleanup job health
- Database grows indefinitely without automation

**Solution:**
Implemented comprehensive automated cleanup system:

1. **30-Day Purge Script** with Cloudinary integration
2. **GitHub Actions Cron Job** runs daily at 2 AM UTC
3. **Maintenance Logging Table** tracks all purge operations
4. **Error Handling & Alerts** for job failures
5. **Alternative Supabase Edge Function** for serverless execution

**Core Purge Script:**

```javascript
// scripts/purge-old-items.js
async function purgeOldItems() {
  console.log('[PURGE] Starting 30-day purge job...');
  const startTime = Date.now();
  
  try {
    // Find items removed more than 30 days ago
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: itemsToDelete, error } = await supabase
      .from('clothes')
      .select('id, image_url, thumbnail_url, owner_id, name')
      .not('removed_at', 'is', null)
      .lt('removed_at', cutoffDate.toISOString());
    
    if (error) throw error;
    
    if (!itemsToDelete || itemsToDelete.length === 0) {
      console.log('[PURGE] No items to purge');
      return { purged: 0, duration: Date.now() - startTime };
    }
    
    console.log(`[PURGE] Found ${itemsToDelete.length} items to purge`);
    
    let cloudinaryDeleted = 0;
    let cloudinaryFailed = 0;
    
    // Delete images from Cloudinary
    for (const item of itemsToDelete) {
      try {
        const publicIds = extractPublicIds(item);
        
        for (const publicId of publicIds) {
          const result = await cloudinary.v2.uploader.destroy(publicId);
          if (result.result === 'ok') {
            cloudinaryDeleted++;
          } else {
            cloudinaryFailed++;
          }
        }
      } catch (error) {
        cloudinaryFailed++;
        console.error(`[PURGE] Error deleting images for item ${item.id}:`, error);
      }
    }
    
    // Hard delete from database
    const { error: deleteError } = await supabase
      .from('clothes')
      .delete()
      .in('id', itemsToDelete.map(i => i.id));
    
    if (deleteError) throw deleteError;
    
    const duration = Date.now() - startTime;
    
    // Log to monitoring
    await logMaintenanceEvent({
      type: 'purge',
      items_purged: itemsToDelete.length,
      cloudinary_deleted: cloudinaryDeleted,
      cloudinary_failed: cloudinaryFailed,
      duration_ms: duration
    });
    
    return {
      purged: itemsToDelete.length,
      cloudinary_deleted: cloudinaryDeleted,
      cloudinary_failed: cloudinaryFailed,
      duration
    };
    
  } catch (error) {
    console.error('[PURGE] Purge job failed:', error);
    throw error;
  }
}
```

**GitHub Actions Cron:**

```yaml
# .github/workflows/purge-old-items.yml
name: Purge Old Items

on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM UTC
  workflow_dispatch:      # Allow manual trigger

jobs:
  purge:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run purge script
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
          CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
          CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
        run: node scripts/purge-old-items.js
      
      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Purge job failed!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**Maintenance Logging:**

```sql
-- Create maintenance logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER,
  status VARCHAR(20) DEFAULT 'success'
);

CREATE INDEX idx_maintenance_logs_timestamp 
ON maintenance_logs(timestamp DESC);
```

**Benefits:**
- Automatic cleanup prevents database bloat
- Cloudinary credits stay within free tier limits
- Maintenance logs provide audit trail
- Manual trigger available for emergency cleanup
- Failure alerts enable quick response

---

### Issue #54: No Storage Management Strategy

**Severity:** HIGH  
**Category:** Performance/Cost  
**File:** `requirements/api-endpoints.md`

**Problem:**
- No Cloudinary usage monitoring
- Unoptimized image transformations
- No thumbnail caching strategy
- Risk of exceeding free tier limits
- No visibility into storage costs

**Solution:**
Implemented comprehensive storage management:

1. **Cloudinary Usage Monitoring** with alerts at 80%
2. **Optimized Thumbnail Generation** (2 sizes: 150px, 400px)
3. **Aggressive URL Caching** to minimize transformations
4. **Usage Dashboard** for administrators
5. **Cost Projection Tools** for planning

**Usage Monitoring Script:**

```javascript
// scripts/check-cloudinary-usage.js
async function checkCloudinaryUsage() {
  try {
    const usage = await cloudinary.v2.api.usage();
    
    console.log('Cloudinary Usage:', {
      plan: usage.plan,
      credits_used: usage.credits.usage,
      credits_limit: usage.credits.limit,
      percentage: (usage.credits.usage / usage.credits.limit * 100).toFixed(2) + '%',
      bandwidth_used_mb: (usage.bandwidth.usage / 1024 / 1024).toFixed(2),
      storage_used_mb: (usage.storage.usage / 1024 / 1024).toFixed(2),
      transformations: usage.transformations.usage
    });
    
    // Alert if approaching limit
    const usagePercentage = (usage.credits.usage / usage.credits.limit) * 100;
    if (usagePercentage > 80) {
      console.warn('⚠️ Approaching Cloudinary credit limit!');
      // Send alert to team
      await sendAlert({
        type: 'cloudinary_limit_warning',
        usage_percentage: usagePercentage,
        credits_used: usage.credits.usage,
        credits_limit: usage.credits.limit
      });
    }
    
  } catch (error) {
    console.error('Failed to check Cloudinary usage:', error);
  }
}
```

**Optimized Thumbnail Generation:**

```javascript
// Only generate 2 thumbnail sizes for efficiency
function generateThumbnailUrl(imageUrl, size = 'medium') {
  const transformations = {
    small: 'c_fill,w_150,h_150,q_auto,f_auto',   // Grid thumbnails
    medium: 'c_fill,w_400,h_400,q_auto,f_auto',  // Detail view
    large: 'c_limit,w_1080,q_auto,f_auto'        // Full size (rare)
  };
  
  // Insert transformation into URL
  return imageUrl.replace('/upload/', `/upload/${transformations[size]}/`);
}

// Cache transformed URLs aggressively
const thumbnailCache = new Map();

function getCachedThumbnail(imageUrl, size) {
  const cacheKey = `${imageUrl}:${size}`;
  
  if (!thumbnailCache.has(cacheKey)) {
    thumbnailCache.set(cacheKey, generateThumbnailUrl(imageUrl, size));
  }
  
  return thumbnailCache.get(cacheKey);
}
```

**Transformation Best Practices:**

```javascript
// ✅ GOOD: Single transformation URL (cached by Cloudinary)
const thumb = 'https://res.cloudinary.com/.../upload/c_fill,w_150,h_150,q_auto,f_auto/image.jpg';

// ❌ BAD: Chained transformations (counts as multiple transformations)
const thumb = 'https://res.cloudinary.com/.../upload/c_fill,w_150/h_150/q_auto/image.jpg';

// ✅ GOOD: Named transformations (pre-configured, most efficient)
const thumb = 'https://res.cloudinary.com/.../upload/t_thumbnail_small/image.jpg';
```

**Usage Dashboard Endpoint:**

```javascript
// GET /api/admin/storage-stats
app.get('/api/admin/storage-stats', authenticateAdmin, async (req, res) => {
  try {
    // Get Cloudinary usage
    const cloudinaryUsage = await cloudinary.v2.api.usage();
    
    // Get database stats
    const { data: dbStats } = await supabase
      .from('clothes')
      .select('id, image_url, removed_at');
    
    const activeImages = dbStats.filter(item => !item.removed_at).length;
    const trashImages = dbStats.filter(item => item.removed_at).length;
    
    res.json({
      cloudinary: {
        credits: {
          used: cloudinaryUsage.credits.usage,
          limit: cloudinaryUsage.credits.limit,
          percentage: (cloudinaryUsage.credits.usage / cloudinaryUsage.credits.limit * 100).toFixed(2)
        },
        storage_mb: (cloudinaryUsage.storage.usage / 1024 / 1024).toFixed(2),
        bandwidth_mb: (cloudinaryUsage.bandwidth.usage / 1024 / 1024).toFixed(2),
        transformations: cloudinaryUsage.transformations.usage
      },
      database: {
        active_images: activeImages,
        trash_images: trashImages,
        total_images: dbStats.length
      },
      projections: {
        days_until_limit: calculateDaysUntilLimit(cloudinaryUsage),
        recommended_action: getRecommendedAction(cloudinaryUsage)
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storage stats' });
  }
});
```

**Benefits:**
- Proactive monitoring prevents service disruption
- Optimized transformations reduce Cloudinary costs
- Cached URLs minimize transformation credits
- Usage dashboard enables data-driven decisions
- Alerts provide early warning of limit approach

---

### Issue #55: Rate Limiting Implementation

**Severity:** HIGH  
**Category:** Security  
**Status:** ✅ ALREADY FIXED IN BATCH 6

**Note:** Rate limiting was comprehensively implemented in Batch 6 (Issue #38) with:
- Per-endpoint rate limits (auth, uploads, reads, writes)
- Both Redis and database implementations
- IP-based rate limiting for unauthenticated endpoints
- Rate limit headers (X-RateLimit-*)
- Dynamic rate limiting for premium users
- Monitoring and alerting for violations

See `BATCH_6_FIXES.md` and `requirements/security.md` for complete implementation details.

---

## Summary of Changes

### Files Modified

1. **requirements/api-endpoints.md**
   - Added quota enforcement middleware with database function integration
   - Added quota headers (X-Quota-Used, X-Quota-Limit, X-Quota-Remaining)
   - Added GET /quota endpoint with warnings and breakdown
   - Enhanced POST /clothes/:id/restore with quota validation and expiration checks
   - Added GET /clothes/trash with 30-day filtering
   - Added Section 4: Scheduled Maintenance & Cleanup (300+ lines)
   - Added 30-day purge script with Cloudinary integration
   - Added GitHub Actions cron job configuration
   - Added maintenance logging table schema
   - Added Cloudinary usage monitoring script
   - Added optimized thumbnail generation patterns
   - Added storage dashboard endpoint

### Impact Assessment

**Quota Management:**
- **User Experience:** Clear feedback at 90%, 95%, and 100% capacity
- **Data Accuracy:** Database function ensures accurate counts
- **Prevention:** Hard blocks at 200 items prevent over-quota uploads
- **Recovery:** Quota validation on restore prevents unexpected errors

**Maintenance Automation:**
- **Database Health:** Automatic 30-day purge prevents bloat
- **Cost Control:** Cloudinary cleanup keeps within free tier
- **Reliability:** Daily cron job with failure alerts
- **Visibility:** Maintenance logs provide audit trail

**Storage Management:**
- **Cost Monitoring:** Alerts at 80% Cloudinary usage
- **Optimization:** 2 thumbnail sizes minimize transformations
- **Caching:** Aggressive URL caching reduces credits
- **Planning:** Usage projections enable proactive decisions

**Operational Benefits:**
- **Automated Operations:** Reduces manual maintenance overhead
- **Proactive Monitoring:** Alerts prevent service disruption
- **Audit Trail:** Maintenance logs for compliance
- **Cost Control:** Stays within free tier limits

### Implementation Priority

**Phase 1: Critical (Immediate)** ✅ COMPLETED
- ✅ Quota enforcement middleware
- ✅ GET /quota endpoint
- ✅ Restore with quota validation
- ✅ 30-day purge script

**Phase 2: High Priority (Week 1)**
- [ ] Deploy GitHub Actions cron job
- [ ] Set up maintenance logging table
- [ ] Configure Slack alerts for failures
- [ ] Deploy quota dashboard UI

**Phase 3: Medium Priority (Week 2)**
- [ ] Cloudinary usage monitoring cron
- [ ] Storage dashboard for admins
- [ ] Usage projection analytics
- [ ] Optimize existing images

**Phase 4: Nice to Have (Week 3+)**
- [ ] Supabase Edge Function alternative
- [ ] Automated Cloudinary backup
- [ ] Image compression analysis
- [ ] User storage analytics

---

## Testing Checklist

### Quota Enforcement Testing
- [ ] Test upload blocked at exactly 200 items
- [ ] Verify quota headers in API responses
- [ ] Test GET /quota endpoint accuracy
- [ ] Verify warnings appear at 180, 190, 200 items
- [ ] Test client-side upload button disable at 100%
- [ ] Verify quota dashboard UI updates in real-time

### Soft Delete Recovery Testing
- [ ] Test restore within 30-day window
- [ ] Test restore fails after 30 days
- [ ] Test restore fails when quota exceeded
- [ ] Verify trash page shows countdown timers
- [ ] Test expiry urgency styling (urgent/warning/normal)
- [ ] Verify GET /clothes/trash filters correctly

### Automated Cleanup Testing
- [ ] Run purge script manually with test data
- [ ] Verify Cloudinary images deleted
- [ ] Verify database records hard deleted
- [ ] Test purge script with no items to delete
- [ ] Verify maintenance logs created
- [ ] Test GitHub Actions workflow manually
- [ ] Verify Slack alert on failure

### Storage Management Testing
- [ ] Run Cloudinary usage monitoring script
- [ ] Verify alert triggers at 80% usage
- [ ] Test thumbnail generation functions
- [ ] Verify thumbnail caching works
- [ ] Test storage dashboard endpoint
- [ ] Verify usage projections are accurate

---

## Related Documentation

- **Database Schema:** `sql/003_indexes_functions.sql` (check_item_quota function)
- **API Endpoints:** `requirements/api-endpoints.md` (all quota and maintenance endpoints)
- **Security:** `requirements/security.md` (rate limiting from Batch 6)
- **Tasks:** `tasks/06-quotas-maintenance.md` (original task requirements)

---

## Maintenance Procedures

### Manual Purge (Emergency)

```bash
# Run purge script manually
node scripts/purge-old-items.js

# Or trigger GitHub Action manually
gh workflow run purge-old-items.yml
```

### Check Cloudinary Usage

```bash
# Run usage check
node scripts/check-cloudinary-usage.js

# View in dashboard
curl https://api.stylesnap.com/admin/storage-stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Query Maintenance Logs

```sql
-- View recent purge jobs
SELECT 
  timestamp,
  details->>'items_purged' as items_purged,
  details->>'cloudinary_deleted' as cloudinary_deleted,
  duration_ms,
  status
FROM maintenance_logs
WHERE event_type = 'purge'
ORDER BY timestamp DESC
LIMIT 10;

-- Check for failures
SELECT * FROM maintenance_logs
WHERE status != 'success'
ORDER BY timestamp DESC;
```

---

## Next Steps

**Batch 8: Final Polish & Documentation**
- Code comments and JSDoc
- Component prop documentation
- API reference generation
- Testing suite setup
- Deployment guides

Ready to proceed with Batch 8 when approved! 🚀
