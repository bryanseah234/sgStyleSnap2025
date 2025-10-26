# Quick Reference Guide

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# Apply all migrations
for file in database/migrations/*.sql; do
  psql -h your-host -U your-user -d your-database -f "$file"
done

# Check database connection
psql -h your-host -U your-user -d your-database -c "SELECT version();"
```

## 📁 Key File Locations

### Core Files
- `src/main.js` - Application entry point
- `src/App.vue` - Root component
- `src/router/index.js` - Route configuration
- `package.json` - Dependencies and scripts

### Pages
- `src/pages/Home.vue` - Dashboard
- `src/pages/Cabinet.vue` - Closet management
- `src/pages/Outfits.vue` - Outfit management
- `src/pages/Friends.vue` - Social features

### Services
- `src/services/authService.js` - Authentication
- `src/services/clothesService.js` - Wardrobe management
- `src/services/outfitsService.js` - Outfit management
- `src/services/friendsService.js` - Social features
- `src/services/notificationsService.js` - Notifications

### Stores
- `src/stores/auth-store.js` - Authentication state
- `src/stores/theme-store.js` - Theme state

## 🔧 Environment Variables

### Required
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
```

## 🗄️ Database Tables

### Core Tables
- `users` - User accounts and profiles
- `clothes` - Clothing items in wardrobes
- `outfits` - Outfit combinations
- `friends` - Friend relationships
- `notifications` - System notifications

### Key Relationships
- `clothes.user_id` → `users.id`
- `outfits.user_id` → `users.id`
- `friends.user_id` → `users.id`
- `friends.friend_id` → `users.id`
- `notifications.recipient_id` → `users.id`
- `notifications.actor_id` → `users.id`

## 🔍 Search Implementation

### Closet Search
```javascript
// Search fields: name, brand, color, category
const filteredItems = computed(() => {
  let filtered = items.value
  if (searchTerm.value) {
    const query = searchTerm.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name?.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query) ||
      item.color?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }
  return filtered
})
```

### Outfits Search
```javascript
// Search fields: outfit_name, name, description
const filteredOutfits = computed(() => {
  let filtered = outfits.value
  if (searchTerm.value) {
    const query = searchTerm.value.toLowerCase()
    filtered = filtered.filter(outfit => 
      outfit.outfit_name?.toLowerCase().includes(query) ||
      outfit.name?.toLowerCase().includes(query) ||
      outfit.description?.toLowerCase().includes(query)
    )
  }
  return filtered
})
```

## 🔔 Notification Types

### Supported Types
- `friend_request` - New friend request
- `friend_request_accepted` - Friend request accepted
- `outfit_shared` - Friend shared outfit
- `friend_outfit_suggestion` - Friend suggested outfit
- `outfit_like` - Someone liked your outfit
- `item_like` - Someone liked your item

### Service Usage
```javascript
import { NotificationsService } from '@/services/notificationsService'

const notificationsService = new NotificationsService()

// Get notifications
const notifications = await notificationsService.getNotifications()

// Mark as read
await notificationsService.markAsRead(notificationId)

// Subscribe to real-time updates
const subscription = notificationsService.subscribe((payload) => {
  console.log('New notification:', payload)
})
```

## 🎨 Theme System

### Usage
```javascript
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()

// Current theme: 'dark' or 'light'
console.log(theme.value)

// Toggle theme
toggleTheme()
```

### CSS Classes
```css
/* Light mode */
.bg-white { background-color: white; }
.text-black { color: black; }

/* Dark mode */
.dark .bg-zinc-900 { background-color: #18181b; }
.dark .text-white { color: white; }
```

## 🚀 Deployment

### Vercel
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Docker
```bash
# Build image
docker build -t stylesnap .

# Run container
docker run -p 80:80 stylesnap
```

## 🐛 Common Issues

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection
```javascript
// Test connection
const { data, error } = await supabase.from('users').select('count')
console.log('Connection:', { data, error })
```

### RLS Policy Violations
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Test policy
SET ROLE authenticated;
SELECT * FROM users WHERE id = auth.uid();
```

## 📊 Performance Tips

### Code Splitting
```javascript
// Route-based splitting
const Cabinet = () => import('@/pages/Cabinet.vue')
const Outfits = () => import('@/pages/Outfits.vue')
```

### Image Optimization
```vue
<img 
  :src="item.image_url" 
  :alt="item.name"
  loading="lazy"
  class="w-full h-full object-cover"
/>
```

### Bundle Analysis
```bash
# Analyze bundle size
npm install -g vite-bundle-analyzer
vite-bundle-analyzer dist
```

## 🔒 Security Checklist

### Environment Variables
- [ ] Supabase URL and keys configured
- [ ] Cloudinary credentials set (if using)
- [ ] Production environment variables secured

### Database Security
- [ ] RLS policies enabled on all tables
- [ ] Authentication configured
- [ ] CORS settings updated

### Application Security
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Input validation implemented

## 📈 Monitoring

### Error Tracking
```javascript
// Add Sentry for error tracking
import { init } from '@sentry/vue'

init({
  app,
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV
})
```

### Performance Monitoring
```javascript
// Add Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

## 🧪 Testing

### Unit Tests (Planned)
```javascript
// Component testing
import { mount } from '@vue/test-utils'
import Cabinet from '@/pages/Cabinet.vue'

test('renders clothing items', () => {
  const wrapper = mount(Cabinet, {
    props: { items: mockItems }
  })
  expect(wrapper.findAll('.item-card')).toHaveLength(mockItems.length)
})
```

### Integration Tests (Planned)
```javascript
// Service testing
import { ClothesService } from '@/services/clothesService'

test('fetches user clothes', async () => {
  const service = new ClothesService()
  const items = await service.getClothes(userId)
  expect(items).toBeDefined()
})
```

---

This quick reference guide provides essential information for developers working with StyleSnap 2025. For detailed information, refer to the comprehensive documentation files.
