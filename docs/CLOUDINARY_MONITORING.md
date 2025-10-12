# Cloudinary Monitoring & Optimization Guide

## Overview

StyleSnap uses Cloudinary for image storage and transformation. This guide covers monitoring usage, staying within free tier limits, and optimizing performance.

## Free Tier Limits

Cloudinary free tier includes:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25 credits/month
- **Images**: Unlimited uploads

**Key Constraints:**
- 50 upload quota per user enforced at application level
- Thumbnail optimization (2 sizes: 150px, 400px)
- Automatic format conversion to WebP
- No video storage (images only)

## Monitoring Usage

### 1. Dashboard Monitoring (Manual)

Access your Cloudinary dashboard at: https://cloudinary.com/console

**Key Metrics to Monitor:**
- Storage used (GB)
- Bandwidth used this month (GB)
- Transformations used this month (credits)
- Number of images stored

**Recommended Check Frequency:**
- Weekly: Check bandwidth and transformation usage
- Monthly: Review storage usage and trends
- Quarterly: Audit for optimization opportunities

### 2. Usage Reports

Cloudinary provides detailed usage reports:

1. Navigate to **Reports** > **Usage**
2. Set date range (daily, weekly, monthly)
3. Review metrics:
   - Image deliveries
   - Transformation credits
   - Bandwidth consumption
   - Storage growth

### 3. Email Alerts

Set up email alerts in Cloudinary dashboard:

1. Go to **Settings** > **Account**
2. Under **Notifications**, enable:
   - Storage limit warnings (at 80%, 90%, 95%)
   - Bandwidth limit warnings (at 80%, 90%, 95%)
   - Monthly usage summaries

## Optimization Strategies

### 1. Image Optimization

**Current Implementation:**
```javascript
// Upload preset configuration
{
  format: 'webp',           // Auto-convert to WebP
  quality: 'auto:best',     // Automatic quality optimization
  fetch_format: 'auto',     // Serve best format per browser
  responsive: true,         // Enable responsive images
  width: 800,               // Max width constraint
  crop: 'limit'             // Don't upscale images
}
```

**Transformations Used:**
- Thumbnail small: `w_150,h_150,c_fill`
- Thumbnail medium: `w_400,h_400,c_fill`
- Original: Stored but served optimized

**Transformation Credits:**
- Small thumbnail: ~0.01 credits per image
- Medium thumbnail: ~0.02 credits per image
- Original optimized: ~0.03 credits per image
- **Total per upload**: ~0.06 credits

With 50 uploads per user and 25 free credits/month:
- Max users per month: ~400 (assuming each uploads max items)
- Realistic: Much higher (most users won't max out)

### 2. Caching Strategy

**Current Implementation:**
- Cloudinary CDN caching (automatic)
- Browser caching via cache headers
- Transformed images cached indefinitely

**Best Practices:**
```javascript
// Use consistent transformation URLs for better cache hits
const getThumbnailUrl = (url, size = 'medium') => {
  const transformations = {
    small: 'w_150,h_150,c_fill',
    medium: 'w_400,h_400,c_fill'
  }
  // Insert transformation into URL
  return url.replace('/upload/', `/upload/${transformations[size]}/`)
}
```

### 3. Lazy Loading

**Implementation:**
- Used in closet item components
- Images load as user scrolls
- Reduces initial bandwidth consumption

**Code Example:**
```vue
<img 
  :src="thumbnailUrl" 
  loading="lazy"
  alt="Closet item"
/>
```

### 4. Responsive Images

**Implementation:**
```vue
<img 
  :srcset="`
    ${getTransformedUrl(url, 'w_150')} 150w,
    ${getTransformedUrl(url, 'w_400')} 400w,
    ${getTransformedUrl(url, 'w_800')} 800w
  `"
  sizes="(max-width: 640px) 150px, (max-width: 1024px) 400px, 800px"
  :src="getTransformedUrl(url, 'w_400')"
  loading="lazy"
/>
```

## Cleanup & Maintenance

### Automated Scripts

**1. Orphaned Image Cleanup** (Weekly)
```bash
# Preview orphaned images
node scripts/cloudinary-cleanup.js --dry-run

# Delete orphaned images
node scripts/cloudinary-cleanup.js
```

**What it removes:**
- Images uploaded but never saved to database
- Images from deleted items (if cleanup failed)
- Images older than 7-day grace period

**2. Old Item Purge** (Monthly)
```bash
# Preview items to be purged
node scripts/purge-old-items.js --dry-run

# Purge old items (2+ years)
node scripts/purge-old-items.js
```

**What it removes:**
- Items older than 730 days (configurable)
- Both database records and Cloudinary images

### Manual Cleanup

**When to perform:**
- Storage approaching 80% of limit
- Bandwidth consistently high
- Transformation credits running low

**Steps:**
1. Run cleanup scripts (see above)
2. Review unused transformations in dashboard
3. Check for duplicate images
4. Audit large images (over 1 MB)

## Troubleshooting

### Issue: Storage Limit Approaching

**Symptoms:**
- Storage usage > 80% (20 GB)
- Email warnings from Cloudinary

**Solutions:**
1. Run orphaned image cleanup: `node scripts/cloudinary-cleanup.js`
2. Run old item purge: `node scripts/purge-old-items.js`
3. Audit for large images (> 1 MB) and re-compress
4. Check for duplicate uploads
5. Consider upgrading to paid tier if growth is legitimate

### Issue: Bandwidth Limit Approaching

**Symptoms:**
- Bandwidth usage > 80% (20 GB/month)
- Slow image loading

**Solutions:**
1. Enable more aggressive CDN caching
2. Implement lazy loading (already done)
3. Use smaller thumbnail sizes
4. Reduce quality setting for thumbnails
5. Investigate unusual traffic patterns (possible abuse)

### Issue: Transformation Credits Exhausted

**Symptoms:**
- Transformation errors
- Original images served instead of optimized

**Solutions:**
1. Reduce number of transformation variants (currently 2)
2. Cache transformed URLs more aggressively
3. Use consistent transformation URLs
4. Consider upgrading to paid tier
5. Review transformation usage in dashboard

### Issue: Upload Failures

**Symptoms:**
- Upload errors in application
- "Quota exceeded" messages

**Solutions:**
1. Check Cloudinary API status
2. Verify API credentials in `.env`
3. Check storage limit hasn't been exceeded
4. Review upload preset configuration
5. Test with manual upload in dashboard

## Monitoring Checklist

### Daily
- [ ] Check for error logs in application
- [ ] Monitor user upload failures (if any)

### Weekly
- [ ] Review bandwidth usage trend
- [ ] Check transformation credits remaining
- [ ] Run Cloudinary cleanup script (automated)
- [ ] Review any email alerts from Cloudinary

### Monthly
- [ ] Review storage usage and growth rate
- [ ] Analyze usage reports in dashboard
- [ ] Run old item purge script (automated)
- [ ] Review and optimize transformation settings
- [ ] Check for cost optimization opportunities

### Quarterly
- [ ] Audit entire image library
- [ ] Review and update upload presets
- [ ] Analyze user upload patterns
- [ ] Plan for capacity (upgrade if needed)
- [ ] Update documentation based on learnings

## Performance Benchmarks

**Target Metrics:**
- Image load time: < 1 second (LCP)
- Thumbnail load time: < 500ms
- Transformation cache hit rate: > 90%
- CDN cache hit rate: > 95%

**Monitoring Tools:**
- Chrome DevTools Network tab
- Lighthouse performance audit
- Cloudinary Analytics dashboard
- Custom logging in application

## Best Practices

1. **Always use transformations** - Don't serve original images
2. **Consistent URLs** - Better caching, lower costs
3. **Lazy loading** - Reduce initial bandwidth
4. **WebP format** - Smaller file sizes
5. **Regular cleanup** - Remove orphaned images weekly
6. **Monitor trends** - Catch issues early
7. **Test uploads** - Verify functionality regularly
8. **Document changes** - Update this guide as needed

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Optimization Guide](https://cloudinary.com/documentation/image_optimization)
- [Free Tier Limits](https://cloudinary.com/pricing)
- [Usage Reports](https://cloudinary.com/console/lui/reports/usage)

## Support

**Cloudinary Support:**
- Email: support@cloudinary.com
- Documentation: https://cloudinary.com/documentation
- Community: https://community.cloudinary.com

**Internal Escalation:**
1. Check monitoring dashboard
2. Review error logs
3. Run cleanup scripts
4. Consult this guide
5. Contact team lead if unresolved
