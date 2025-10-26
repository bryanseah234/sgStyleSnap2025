# Edge Function User Synchronization

This document describes the Edge Function-based user synchronization system that replaced database triggers in Migration 041.

## 🚀 Overview

The `sync-auth-users-realtime` Edge Function handles real-time user synchronization between the `auth.users` table and the `public.users` table. This architecture provides better scalability, error handling, and maintainability compared to the previous database trigger approach.

## 🔄 Architecture

### Before (Database Triggers)
```
Google OAuth → auth.users → Database Trigger → public.users
```

### After (Edge Function)
```
Google OAuth → auth.users → Edge Function → public.users
```

## 🛠️ Edge Function Details

### Function Name
`sync-auth-users-realtime`

### Status
- **Deployed**: ✅ Active
- **Verify JWT**: ✅ Enabled
- **Entrypoint**: `supabase/functions/sync-auth-users-realtime/index.ts`
- **Project ID**: `nztqjmknblelnzpeatyx`

### Purpose
- Synchronize new user registrations from `auth.users` to `public.users`
- Handle user profile updates in real-time
- Provide detailed logging and error handling
- Ensure data consistency between auth and public schemas
- Keep auth.users in sync with realtime tables/messages

## 📋 Features

### Automatic User Creation
- **New Users**: Automatically creates profile in `public.users` when signing up
- **Profile Sync**: Syncs Google OAuth data (email, name, avatar, etc.)
- **Username Generation**: Auto-generates unique usernames from email
- **Error Handling**: Graceful handling of sync failures

### Real-time Synchronization
- **Immediate Sync**: Users are synced immediately upon authentication
- **Event-driven**: Responds to auth events in real-time
- **Reliable**: Built-in retry mechanisms for failed syncs

### Comprehensive Logging
- **Detailed Logs**: All sync operations are logged for debugging
- **Error Tracking**: Failed syncs are logged with detailed error messages
- **Performance Metrics**: Track sync performance and success rates

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_SYNC_FUNCTION_URL=https://your-project.supabase.co/functions/v1/sync-auth-users-realtime
```

### Supabase Configuration
- Edge Function must be deployed and active
- JWT verification enabled for security
- Proper RLS policies configured for `public.users` table

## 📊 Monitoring

### Health Checks
```javascript
import { edgeFunctionHealthService } from '@/services/edgeFunctionHealthService'

// Check Edge Function health
const health = await edgeFunctionHealthService.checkHealth()

// Check deployment status
const deployment = await edgeFunctionHealthService.checkDeploymentStatus()

// Get performance metrics
const metrics = await edgeFunctionHealthService.getSyncPerformanceMetrics()
```

### Log Monitoring
- **Supabase Dashboard**: Go to Logs → Edge Functions
- **Real-time Monitoring**: Monitor sync activity in real-time
- **Error Alerts**: Set up alerts for sync failures

## 🧪 Testing

### Manual Testing
```javascript
// Test user sync
const syncTest = await edgeFunctionHealthService.testUserSync(userId)

// Check if user exists in public.users
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

### Integration Testing
1. **Sign up with Google OAuth**
2. **Verify user creation in `public.users`**
3. **Check Edge Function logs for sync activity**
4. **Verify profile data is correctly synced**

## 🐛 Troubleshooting

### Common Issues

#### Edge Function Not Deployed
**Symptoms**: Users not being created in `public.users`
**Fix**: 
1. Deploy Edge Function: `supabase functions deploy sync-auth-users-realtime`
2. Verify deployment status in Supabase dashboard

#### Edge Function Errors
**Symptoms**: Sync failures in logs
**Fix**:
1. Check Edge Function logs in Supabase dashboard
2. Verify RLS policies on `public.users` table
3. Check function permissions and service role access

#### User Sync Delays
**Symptoms**: Users created but not immediately synced
**Fix**:
1. Check Edge Function performance metrics
2. Verify function is not rate-limited
3. Check for any network issues

### Debug Steps

1. **Check Edge Function Status**:
   ```javascript
   const status = await edgeFunctionHealthService.checkDeploymentStatus()
   ```

2. **Verify User Creation**:
   ```sql
   SELECT * FROM public.users WHERE id = 'user-id';
   ```

3. **Check Edge Function Logs**:
   - Go to Supabase → Logs → Edge Functions
   - Look for sync-auth-users-realtime logs

4. **Test Function Health**:
   ```javascript
   const health = await edgeFunctionHealthService.checkHealth()
   ```

## 🔒 Security

### JWT Verification
- Edge Function verifies JWT tokens for security
- Only authenticated requests can trigger sync operations
- Service role permissions required for database operations

### RLS Integration
- Edge Function respects Row Level Security policies
- Users can only be created with proper permissions
- Data privacy maintained through RLS policies

## 📈 Performance

### Scalability Benefits
- **Concurrent Users**: Can handle multiple simultaneous user registrations
- **Better Error Handling**: Detailed error reporting and retry mechanisms
- **Monitoring**: Built-in performance metrics and monitoring

### Performance Metrics
- **Response Time**: Edge Function response times
- **Success Rate**: Percentage of successful syncs
- **Throughput**: Number of users synced per minute

## 🔮 Future Enhancements

### Planned Features
- **Batch Processing**: Sync multiple users in batches
- **Retry Logic**: Automatic retry for failed syncs
- **Metrics Dashboard**: Real-time sync performance dashboard
- **Alerting**: Automated alerts for sync failures

### Configuration Options
- **Sync Frequency**: Configurable sync intervals
- **Retry Policies**: Customizable retry mechanisms
- **Monitoring**: Enhanced monitoring and alerting

## 📚 API Reference

### Edge Function Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/sync` | POST | Manual sync trigger |
| `/metrics` | GET | Performance metrics |

### Service Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `checkHealth()` | `Promise<Object>` | Check Edge Function health |
| `checkDeploymentStatus()` | `Promise<Object>` | Check deployment status |
| `getSyncPerformanceMetrics()` | `Promise<Object>` | Get performance metrics |
| `testUserSync(userId)` | `Promise<Object>` | Test user sync |

## 🤝 Contributing

When contributing to the Edge Function:

1. **Test Thoroughly**: Always test with real user registrations
2. **Monitor Logs**: Check Edge Function logs for any issues
3. **Handle Errors**: Ensure graceful error handling
4. **Update Documentation**: Keep this documentation up-to-date
5. **Performance**: Consider impact on sync performance

## 📝 Changelog

### v2.0.0 (Edge Function Architecture)
- ✅ Replaced database triggers with Edge Function
- ✅ Improved error handling and logging
- ✅ Better scalability for concurrent users
- ✅ Real-time synchronization via Supabase Edge Functions

### v1.0.0 (Database Triggers - Deprecated)
- ✅ Database trigger-based user synchronization
- ✅ Basic error handling
- ❌ Limited scalability
- ❌ Difficult debugging

---

**Note**: This Edge Function architecture provides a more robust, scalable, and maintainable solution for user synchronization compared to the previous database trigger approach.
