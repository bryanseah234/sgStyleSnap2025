# Frontend Edge Function Integration

This document describes how the frontend JavaScript code has been updated to properly integrate with the new Edge Function-based user synchronization architecture.

## 🔄 Architecture Changes

### Before (Database Triggers)
- Frontend manually created user profiles via `createUserProfile()`
- Direct database insertion in auth service
- No monitoring of sync process

### After (Edge Functions)
- Edge Function `sync-auth-users-realtime` handles user profile creation
- Frontend waits for Edge Function to create profiles
- Comprehensive monitoring and health checks

## 🛠️ Updated Frontend Components

### 1. AuthService (`src/services/authService.js`)

#### Updated `createUserProfile()` Method

**Before:**
```javascript
async createUserProfile(authUser) {
  // Direct database insertion
  const { data, error } = await supabase
    .from('users')
    .insert(profileData)
    .select()
    .single()
}
```

**After:**
```javascript
async createUserProfile(authUser) {
  // Wait for Edge Function to create profile with polling
  const maxAttempts = 10
  const baseDelay = 1000
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (data) {
      return data // Profile created by Edge Function
    }
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)))
  }
}
```

### 2. Auth Store (`src/stores/auth-store.js`)

#### Updated Profile Creation Logic

**Before:**
```javascript
// Try to get the profile, which will create it if it doesn't exist
const profile = await authService.getCurrentProfile()
```

**After:**
```javascript
// First, try to get the profile
let profile = await authService.getCurrentProfile()

if (profile) {
  this.profile = profile
} else {
  // Wait for Edge Function to create the profile
  const syncStatus = await edgeFunctionSyncService.waitForUserSync(user.id, 15000)
  
  if (syncStatus.success && syncStatus.synced) {
    this.profile = syncStatus.user
  } else {
    // Fallback: try to create profile manually
    profile = await authService.createUserProfile(user)
  }
}
```

### 3. New Edge Function Sync Service (`src/services/edgeFunctionSyncService.js`)

#### Key Methods

```javascript
// Monitor user sync status
async monitorUserSync(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  return {
    success: true,
    synced: !!user,
    status: user ? 'completed' : 'pending',
    user: user
  }
}

// Wait for sync completion
async waitForUserSync(userId, maxWaitTime = 30000) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    const syncStatus = await this.monitorUserSync(userId)
    
    if (syncStatus.synced) {
      return syncStatus
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return { success: false, status: 'timeout' }
}
```

### 4. Enhanced Edge Function Health Service (`src/services/edgeFunctionHealthService.js`)

#### Updated Health Checks

```javascript
async checkHealth() {
  const response = await fetch(`${this.functionUrl}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await this.getSupabaseToken()}`
    }
  })
  
  return {
    success: response.ok,
    healthy: response.ok,
    data: await response.json()
  }
}
```

### 5. Main Application (`src/main.js`)

#### Edge Function Health Monitoring

```javascript
const authInitPromise = authStore.initializeAuth().then(async () => {
  // Load user theme preferences
  await themeStore.loadUser()
  
  // Check Edge Function health in background
  const { edgeFunctionSyncService } = await import('@/services/edgeFunctionSyncService')
  const healthStatus = await edgeFunctionSyncService.checkSyncHealth()
  
  if (healthStatus.success && healthStatus.healthy) {
    console.log('✅ Edge Function sync service is healthy')
  }
})
```

## 🔍 Monitoring and Debugging

### Console Logging

The updated frontend provides comprehensive logging for Edge Function integration:

```
🔧 AuthService: ========== Waiting for Edge Function to Create Profile ==========
🔧 AuthService: Edge Function sync-auth-users-realtime should create profile automatically
🔧 AuthService: Checking for profile creation (attempt 1/10)
✅ AuthService: Profile created by Edge Function successfully!
```

### Health Monitoring

```javascript
// Check Edge Function health
const health = await edgeFunctionSyncService.checkSyncHealth()

// Monitor user sync status
const syncStatus = await edgeFunctionSyncService.monitorUserSync(userId)

// Wait for sync completion
const result = await edgeFunctionSyncService.waitForUserSync(userId, 15000)
```

## 🚀 Benefits of Updated Architecture

### 1. Better Error Handling
- Comprehensive error logging and reporting
- Graceful fallback mechanisms
- Timeout handling for sync operations

### 2. Improved User Experience
- Non-blocking profile creation
- Real-time sync status monitoring
- Automatic retry mechanisms

### 3. Enhanced Monitoring
- Edge Function health checks
- Sync status monitoring
- Performance metrics tracking

### 4. Scalability
- Edge Function handles concurrent user registrations
- Reduced database load on frontend
- Better resource utilization

## 🧪 Testing the Integration

### 1. Test User Registration

```javascript
// Test new user registration
const { authService } = await import('@/services/authService')
const { edgeFunctionSyncService } = await import('@/services/edgeFunctionSyncService')

// Sign in with Google
await authService.signInWithGoogle()

// Monitor sync process
const syncStatus = await edgeFunctionSyncService.waitForUserSync(userId)
console.log('Sync result:', syncStatus)
```

### 2. Test Edge Function Health

```javascript
// Check Edge Function health
const health = await edgeFunctionSyncService.checkSyncHealth()
console.log('Health status:', health)

// Test connectivity
const connectivity = await edgeFunctionSyncService.testConnectivity()
console.log('Connectivity:', connectivity)
```

### 3. Test Sync Monitoring

```javascript
// Monitor user sync
const syncStatus = await edgeFunctionSyncService.monitorUserSync(userId)
console.log('Sync status:', syncStatus)
```

## 🔧 Configuration

### Environment Variables

```env
# Edge Function URL
VITE_SUPABASE_SYNC_FUNCTION_URL=https://your-project.supabase.co/functions/v1/sync-auth-users-realtime

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Service Configuration

```javascript
// Edge Function Sync Service
const edgeFunctionSyncService = new EdgeFunctionSyncService()

// Edge Function Health Service
const edgeFunctionHealthService = new EdgeFunctionHealthService()
```

## 🐛 Troubleshooting

### Common Issues

1. **Edge Function Not Responding**
   - Check Edge Function deployment status
   - Verify environment variables
   - Check network connectivity

2. **Profile Not Created**
   - Monitor Edge Function logs
   - Check sync status monitoring
   - Verify RLS policies

3. **Sync Timeout**
   - Increase timeout values
   - Check Edge Function performance
   - Monitor database performance

### Debug Steps

1. **Check Console Logs**
   ```javascript
   // Enable detailed logging
   console.log('🔍 EdgeFunctionSync: Monitoring user sync...')
   ```

2. **Monitor Sync Status**
   ```javascript
   const syncStatus = await edgeFunctionSyncService.monitorUserSync(userId)
   console.log('Sync status:', syncStatus)
   ```

3. **Check Edge Function Health**
   ```javascript
   const health = await edgeFunctionSyncService.checkSyncHealth()
   console.log('Health status:', health)
   ```

## 📚 Related Documentation

- [Edge Function Sync](./EDGE_FUNCTION_SYNC.md) - Complete Edge Function documentation
- [Authentication Guide](../guides/AUTHENTICATION_GUIDE.md) - Updated authentication flow
- [Database Guide](../guides/DATABASE_GUIDE.md) - Database architecture updates

---

**Last Updated**: Frontend Edge Function Integration
**Status**: ✅ Frontend code updated for Edge Function architecture
**Next**: Testing and verification of integration

