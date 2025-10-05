# Task 6: Quotas & Maintenance

**Estimated Duration**: 4 days  
**Dependencies**: Task 5 complete  
**Requirements**: [REQ: api-endpoints], [REQ: performance]

## 6.1 Quota Management
- [ ] Display current usage (X/200 items) in closet
- [ ] Show warning at 180 items with progress bar
- [ ] Block uploads at 200 with clear messaging
- [ ] Build quota dashboard in profile page
- [ ] Implement quota calculation utility

## 6.2 Scheduled Maintenance
- [ ] Implement 30-day purge script
  - Query items with removed_at > 30 days
  - Delete from Cloudinary via API
  - Hard delete from database
- [ ] Set up scheduled job for purge script
- [ ] Add logging for maintenance tasks
- [ ] Create admin dashboard for maintenance monitoring

## 6.3 Cloudinary Optimization
- [ ] Generate only 2 thumbnail sizes (150px, 400px)
- [ ] Cache transformed URLs aggressively
- [ ] Implement usage monitoring alerts
- [ ] Document manual monitoring process
- [ ] Set up Cloudinary auto-backup strategy

## 6.4 Performance Optimization
- [ ] Implement lazy loading for closet images
- [ ] Add virtual scrolling for large lists
- [ ] Optimize bundle size with code splitting
- [ ] Set up performance monitoring

## Files to Create:
src/
components/
ui/
ProgressBar.vue
QuotaIndicator.vue
utils/
quota-calculator.js
maintenance-helpers.js
scripts/
purge-old-items.js
cloudinary-cleanup.js


## Acceptance Criteria:
- [ ] Users see clear quota usage and warnings
- [ ] Uploads blocked at 200 items with helpful message
- [ ] 30-day purge script works automatically
- [ ] Cloudinary usage stays within free tier limits
- [ ] Performance metrics meet targets

