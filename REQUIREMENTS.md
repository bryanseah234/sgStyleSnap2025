# StyleSnap - Requirements Index

## Core Requirements
1. [Database Schema](requirements/database-schema.md)
2. [API Endpoints](requirements/api-endpoints.md)
3. [Frontend Components](requirements/frontend-components.md)
4. [Security](requirements/security.md)
5. [Error Handling](requirements/error-handling.md)
6. [Performance](requirements/performance.md)

## Additional References
- [Project Context](PROJECT_CONTEXT.md)
- [Tasks Overview](TASKS.md)
- [SQL Migrations](sql/)

## Quick Reference
### Quota Limits
- **Max User Uploads:** 50 items (images uploaded by user)
- **Catalog Additions:** Unlimited (items added from pre-populated catalog)
- **Warning Threshold:** 45 uploads (90%)
- **Blocked:** At 50 uploads, can only add from catalog
- **Image Size Limit**: 1MB after resize
- **Supported Categories**: top, bottom, outerwear, shoes, accessory
- **Privacy Levels**: private, friends
- **Friend Status**: pending, accepted, rejected

### Upload Methods (Device-Specific)
- **Desktop/Laptop:** File upload only (select from file system)
- **Mobile/Tablet:** File upload + camera capture (take photo directly)

### Catalog Privacy
- **Anonymous Browsing:** All catalog items displayed without owner information
- **No Attribution:** Users cannot see who uploaded catalog items (admin or other users)
- **Privacy by Design:** catalog_items table has no owner_id column

### Catalog Auto-Contribution
- **Automatic Addition:** User uploads automatically added to catalog (no prompt)
- **Background Process:** Catalog contribution happens silently after successful upload
- **Smart Filtering:** Catalog browse excludes items user already owns