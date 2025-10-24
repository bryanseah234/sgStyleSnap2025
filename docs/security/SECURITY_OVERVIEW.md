# Security Overview

This document provides a comprehensive overview of the security implementation in StyleSnap, including Row Level Security (RLS) policies, authentication, and data protection measures.

## 🔐 Security Architecture

StyleSnap implements a multi-layered security approach:

1. **Authentication**: Google OAuth 2.0 exclusively
2. **Authorization**: Row Level Security (RLS) policies
3. **Data Protection**: Encryption at rest and in transit
4. **Access Control**: Role-based permissions and policies

## 🛡️ Row Level Security (RLS)

### Overview

All database tables implement comprehensive RLS policies to ensure data privacy and security. The system uses 91+ RLS policies across all schemas.

### Policy Categories

1. **Ownership-Based Policies**: Users can only access their own data
2. **Friendship-Based Policies**: Controlled access to friends' data
3. **Public Access Policies**: Limited public access for catalog items
4. **Service Role Policies**: Administrative access for system operations

### Detailed Policy Reference

For a complete reference of all RLS policies, see:
- **[RLS Policies Reference](./RLS_POLICIES_REFERENCE.md)** - Comprehensive table-by-table policy documentation

## 🔑 Authentication & Authorization

### Authentication Method

- **Google OAuth 2.0**: Exclusive authentication method
- **JWT Tokens**: Supabase-managed JWT tokens
- **Session Management**: Secure session handling with auto-refresh

### Authorization Levels

1. **Public**: Unauthenticated users (limited access)
2. **Authenticated**: Logged-in users (full personal access)
3. **Service Role**: System operations (bypass RLS when needed)

## 🔒 Data Protection

### Encryption

- **At Rest**: Supabase provides automatic encryption
- **In Transit**: TLS encryption for all connections
- **Application Level**: Sensitive data encrypted before storage

### Privacy Controls

- **User Data**: Private by default
- **Friendship Privacy**: Users control visibility to friends
- **Public Content**: Limited public access for catalog items
- **Profile Privacy**: Users control profile visibility

## 🚨 Security Features

### Input Validation

- **Search Queries**: Minimum 3 characters, maximum 10 results
- **File Uploads**: Type validation, size limits (5 MB)
- **Messages**: Maximum 100 characters, trimmed whitespace
- **SQL Injection Prevention**: Parameterized queries only

### Error Handling

- **Comprehensive Logging**: All operations logged with context
- **User-Friendly Messages**: No sensitive information in error messages
- **Graceful Failures**: System continues operating on individual failures

### Monitoring

- **Edge Function Health**: Real-time monitoring of sync functions
- **Performance Metrics**: System health and performance tracking
- **Audit Logs**: Supabase provides comprehensive audit logging

## 🔍 Security Testing

### RLS Policy Testing

```sql
-- Test policy enforcement
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Authentication Testing

```javascript
// Test authentication status
const { data: { user } } = await supabase.auth.getUser();

// Test RLS enforcement
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 'other-user-id'); // Should fail due to RLS
```

## 🛠️ Security Configuration

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Function Configuration
VITE_SUPABASE_SYNC_FUNCTION_URL=https://your-project.supabase.co/functions/v1/sync-auth-users-realtime
```

### RLS Policy Management

- **Migration-Based**: All policies managed through database migrations
- **Version Controlled**: Policy changes tracked in version control
- **Tested**: Policies tested before deployment

## 📊 Security Monitoring

### Health Checks

```javascript
import { edgeFunctionHealthService } from '@/services/edgeFunctionHealthService'

// Check Edge Function health
const health = await edgeFunctionHealthService.checkHealth()

// Check deployment status
const deployment = await edgeFunctionHealthService.checkDeploymentStatus()
```

### Log Monitoring

- **Supabase Dashboard**: Real-time logs and monitoring
- **Edge Function Logs**: Sync function activity monitoring
- **Error Tracking**: Comprehensive error logging and tracking

## 🚀 Security Best Practices

### Development

1. **Always use RLS**: Never bypass RLS policies
2. **Validate Input**: Validate all user inputs
3. **Use Parameterized Queries**: Prevent SQL injection
4. **Handle Errors Gracefully**: Don't expose sensitive information
5. **Test Security**: Regularly test RLS policies and authentication

### Deployment

1. **Environment Variables**: Secure configuration management
2. **Access Control**: Limit access to production systems
3. **Monitoring**: Continuous security monitoring
4. **Updates**: Regular security updates and patches

## 🔧 Troubleshooting Security Issues

### Common Issues

1. **RLS Policy Violations**: Check policy configuration and user permissions
2. **Authentication Failures**: Verify OAuth configuration and tokens
3. **Edge Function Errors**: Check function deployment and logs
4. **Permission Denied**: Verify user roles and policy conditions

### Debug Steps

1. **Check RLS Policies**: Verify policies are correctly configured
2. **Test Authentication**: Ensure OAuth flow is working
3. **Monitor Logs**: Check Supabase logs for security issues
4. **Verify Permissions**: Ensure user has correct permissions

## 📚 Related Documentation

- [RLS Policies Reference](./RLS_POLICIES_REFERENCE.md)
- [Database Guide](../guides/DATABASE_GUIDE.md)
- [Authentication Guide](../guides/AUTHENTICATION_GUIDE.md)
- [Edge Function Documentation](../features/EDGE_FUNCTION_SYNC.md)

---

**Last Updated**: Migration 041 - Edge Function Architecture
**Security Status**: ✅ Comprehensive RLS policies implemented
**Coverage**: All tables secured with appropriate policies
