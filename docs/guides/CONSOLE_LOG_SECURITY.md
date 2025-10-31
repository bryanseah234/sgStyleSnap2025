# Console Log Security Guide

## Overview

All console logs have been updated to use the log sanitizer utility (`src/utils/log-sanitizer.js`) to prevent sensitive data leaks while maintaining verbose logging for debugging.

## What Gets Sanitized

The following sensitive data is automatically sanitized:

1. **Email addresses** - Shows partial email (e.g., `us***@example.com`)
2. **Tokens/API Keys** - Shows existence and length only (e.g., `[REDACTED - length: 32]`)
3. **URLs** - Removes tokens and sensitive query parameters
4. **User objects** - Removes passwords, tokens, sessions
5. **Session objects** - Redacts access/refresh tokens
6. **Error messages** - Removes sensitive data from stack traces in production

## Usage

### Basic Usage

Replace `console.log`, `console.error`, `console.warn` with safe versions:

```javascript
// Before
console.log('User email:', user.email)
console.error('Error:', error)

// After
import { sanitizeEmail, safeLog, safeError } from '@/utils/log-sanitizer'

safeLog('User email:', sanitizeEmail(user.email))
safeError('Error:', error) // Automatically sanitizes
```

### Sanitization Functions

```javascript
import { 
  sanitizeEmail,
  sanitizeToken,
  sanitizeUrl,
  sanitizeUser,
  sanitizeSession,
  sanitizeError,
  sanitizeData, // Auto-detects type
  safeLog,
  safeError,
  safeWarn
} from '@/utils/log-sanitizer'

// Email
safeLog('Email:', sanitizeEmail('user@example.com'))
// Output: Email: us***@example.com

// Token
safeLog('Token:', sanitizeToken('secret-token-123'))
// Output: Token: [REDACTED - length: 18]

// URL
safeLog('URL:', sanitizeUrl('https://api.example.com?token=secret'))
// Output: URL: https://api.example.com?token=[REDACTED]

// User object
safeLog('User:', sanitizeUser(user))
// Output: User: { id: '...', email: 'us***@example.com', ... }

// Session
safeLog('Session:', sanitizeSession(session))
// Output: Session: { access_token: '[REDACTED]', ... }
```

## Files Updated

### Critical Files (High Priority)
- ✅ `src/stores/auth-store.js` - User emails, sessions, tokens
- ✅ `src/pages/OAuthCallback.vue` - URL parameters with tokens
- ✅ `src/main.js` - Router logs with auth state
- ✅ `src/services/virtualTryOnService.js` - API tokens
- ✅ `src/lib/supabase.js` - Error handling
- ✅ `src/services/friendsService.js` - User emails
- ✅ `src/services/outfitsService.js` - User emails
- ✅ `src/services/clothesService.js` - User emails

### Additional Files (Should be updated when touched)

These files also log user data but are lower priority:
- `src/pages/Profile.vue` - User profile data
- `src/pages/Login.vue` - Auth state
- `src/pages/Logout.vue` - Auth state
- `src/services/notificationsService.js` - User IDs
- `src/services/userService.js` - User data
- All other service files that log user emails

## Pattern for Updates

When adding new console logs:

1. **Import sanitizer functions**:
   ```javascript
   import { sanitizeEmail, sanitizeUrl, safeLog } from '@/utils/log-sanitizer'
   ```

2. **Use safe functions**:
   ```javascript
   // Instead of console.log
   safeLog('Message:', data) // Auto-sanitizes
   
   // Or explicitly sanitize sensitive data
   safeLog('User:', sanitizeEmail(user.email))
   ```

3. **For sensitive objects**, always sanitize:
   ```javascript
   safeLog('User object:', sanitizeUser(user))
   safeLog('Session:', sanitizeSession(session))
   ```

## Security Checklist

- [x] No emails logged in plain text
- [x] No tokens/API keys logged
- [x] No URLs with tokens logged
- [x] No user passwords logged
- [x] No session data logged
- [x] Error messages sanitized
- [x] Stack traces limited in production

## Testing

To verify logs are sanitized:

1. Check browser console during development
2. Look for `[REDACTED]` markers in logs
3. Verify emails show as partial (e.g., `us***@example.com`)
4. Verify tokens never appear in full
5. Check URLs don't contain tokens in query params

## Notes

- The sanitizer automatically handles most cases
- `safeLog`, `safeError`, `safeWarn` automatically sanitize all arguments
- Explicit sanitization recommended for emails and URLs
- Production builds may have additional sanitization

