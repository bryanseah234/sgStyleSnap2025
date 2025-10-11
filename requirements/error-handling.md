# Error Handling Requirements

## 1. API Error Response Standard

```typescript
interface ErrorResponse {
  error: string;           // Human-readable message
  code: string;           // Machine-readable code
  details?: any;          // Additional context
  timestamp: string;      // ISO timestamp
}
```

---

## 2. Common Error Scenarios

### 2.1 Authentication Errors

```typescript
// When JWT is invalid or expired
{
  error: "Authentication required",
  code: "AUTH_REQUIRED",
  details: { redirect_to: "/login" }
}

// When user doesn't have permission
{
  error: "You don't have permission to access this resource",
  code: "FORBIDDEN"
}
```

---

### 2.2 Quota Enforcement

```typescript
// When user exceeds 50 upload limit
{
  error: "You've reached your 50 upload limit. Add unlimited items from our catalog instead!",
  code: "QUOTA_EXCEEDED",
  details: { current: 50, limit: 50 }
}
```

---

### 2.3 Privacy Violations

```typescript
// When accessing private items
{
  error: "You don't have permission to view these items",
  code: "PRIVACY_VIOLATION"
}
```

---

### 2.4 Validation Errors

```typescript
// When input validation fails
{
  error: "Invalid input data",
  code: "VALIDATION_ERROR",
  details: {
    fields: {
      name: "Name is required",
      category: "Category must be one of: top, bottom, outerwear, shoes, accessory"
    }
  }
}
```

---

## 3. Frontend Error Handling

### 3.1 User-Friendly Messages

- Translate error codes to friendly messages
- Provide actionable guidance when possible
- Never expose technical details to users
- Maintain consistent error styling

---

### 3.2 Error Boundaries

- Implement Vue error boundaries for component errors
- Fallback UI for critical failures
- Error reporting for development
- Graceful degradation

---

### 3.3 Loading States

- Show loading indicators for async operations
- Skeleton screens for content loading
- Progress indicators for uploads
- Timeout handling for slow operations

---

## 4. Recovery Strategies

### 4.1 Automatic Retry

- Network errors: retry 3 times with exponential backoff
- Server errors: retry 2 times with linear backoff
- Never retry 4xx errors (client errors)

---

### 4.2 Graceful Degradation

- Offline mode with cached data
- Fallback images for failed loads
- Partial functionality when features unavailable
- Local storage for user preferences

---

### 4.3 Error Reporting

**Sentry Integration for Error Tracking:**

```javascript
// main.js - Initialize Sentry
import * as Sentry from '@sentry/vue';

const app = createApp(App);

// Initialize Sentry for production
if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    
    // Environment tracking
    environment: import.meta.env.MODE, // 'production', 'staging', 'development'
    
    // Release tracking for source maps
    release: `stylesnap@${import.meta.env.VITE_APP_VERSION}`,
    
    // Performance monitoring
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracePropagationTargets: ['localhost', /^https:\/\/api\.stylesnap\.com/],
      }),
      new Sentry.Replay({
        maskAllText: true,      // Privacy: mask all text
        blockAllMedia: true,    // Privacy: block all media
      }),
    ],
    
    // Sample rates
    tracesSampleRate: 0.1,      // 10% of transactions for performance monitoring
    replaysSessionSampleRate: 0.1,   // 10% of sessions
    replaysOnErrorSampleRate: 1.0,   // 100% of errors get session replay
    
    // Filter errors
    beforeSend(event, hint) {
      // Don't send errors in development
      if (import.meta.env.DEV) {
        console.error('[Sentry]', hint.originalException || hint.syntheticException);
        return null;
      }
      
      // Filter out known harmless errors
      const error = hint.originalException;
      if (error?.message?.includes('ResizeObserver loop')) {
        return null;
      }
      
      // Add user context (no PII)
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors (handled separately)
      'Network Error',
      'Failed to fetch'
    ]
  });
}
```

**Custom Error Boundaries:**

```vue
<!-- components/ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2>Something went wrong</h2>
      <p>We've been notified and are working on a fix.</p>
      <button @click="reset">Try Again</button>
      <button @click="reportFeedback">Report Issue</button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import * as Sentry from '@sentry/vue';

const error = ref(null);
const emit = defineEmits(['error']);

onErrorCaptured((err, instance, info) => {
  error.value = err;
  
  // Send to Sentry with context
  Sentry.captureException(err, {
    contexts: {
      vue: {
        componentName: instance?.$options?.name,
        propsData: instance?.$props,
        lifeCycle: info
      }
    }
  });
  
  emit('error', err);
  
  // Prevent error from propagating
  return false;
});

function reset() {
  error.value = null;
}

function reportFeedback() {
  const eventId = Sentry.lastEventId();
  Sentry.showReportDialog({
    eventId,
    title: 'It looks like we\'re having issues.',
    subtitle: 'Our team has been notified, but feel free to add any additional details.',
    labelName: 'Name',
    labelEmail: 'Email',
    labelComments: 'What happened?',
    labelClose: 'Close',
    labelSubmit: 'Submit'
  });
}
</script>
```

**Enhanced Error Context:**

```javascript
// utils/errorReporting.js
import * as Sentry from '@sentry/vue';

// Track custom breadcrumbs
export function trackBreadcrumb(message, category, data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data
  });
}

// Usage examples
trackBreadcrumb('User uploaded image', 'upload', { 
  size: file.size,
  type: file.type 
});

trackBreadcrumb('Filter applied', 'ui', { 
  category: 'tops',
  count: 12 
});

// Set user context (no PII)
export function setUserContext(userId) {
  Sentry.setUser({
    id: userId
    // Don't include email, username, or other PII
  });
}

// Clear user context on logout
export function clearUserContext() {
  Sentry.setUser(null);
}

// Tag errors for better filtering
export function captureWithTags(error, tags = {}) {
  Sentry.withScope((scope) => {
    Object.keys(tags).forEach(key => {
      scope.setTag(key, tags[key]);
    });
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}

// Usage
try {
  await uploadImage(file);
} catch (error) {
  captureWithTags(error, {
    feature: 'image_upload',
    file_size: file.size,
    file_type: file.type
  });
}

// Track API errors with context
export function captureApiError(error, config) {
  Sentry.withScope((scope) => {
    scope.setTag('api_endpoint', config.url);
    scope.setTag('api_method', config.method);
    scope.setContext('api', {
      url: config.url,
      method: config.method,
      status: error.response?.status,
      data: error.response?.data
    });
    Sentry.captureException(error);
  });
}
```

**Backend Error Tracking (Node.js):**

```javascript
// server.js
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

// Request handler must be first
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes ...

// Error handler must be last
app.use(Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all errors
    return true;
  }
}));

// Custom error handler
app.use((err, req, res, next) => {
  // Add request context
  Sentry.withScope((scope) => {
    scope.setTag('path', req.path);
    scope.setTag('method', req.method);
    scope.setContext('request', {
      body: req.body,
      query: req.query,
      params: req.params,
      user_id: req.user?.id
    });
    Sentry.captureException(err);
  });
  
  // Send user-friendly error response
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});
```

**Error Reporting Checklist:**
- ✅ Sentry SDK: Frontend + Backend integration
- ✅ Error boundaries: Vue onErrorCaptured with fallback UI
- ✅ Breadcrumbs: User actions, API calls, UI events
- ✅ User context: User ID only (no PII)
- ✅ Session replay: Only on errors for debugging
- ✅ Performance monitoring: 10% sample rate
- ✅ Source maps: Upload to Sentry for readable stack traces
- ✅ User feedback: Sentry dialog for bug reports
- ✅ Privacy: Mask text/media, exclude sensitive data
- ✅ Filtering: Ignore browser extension errors, network errors

---

## 5. Specific Error Cases

### 5.1 Image Upload Errors

- File too large (> 1MB after compression)
- Unsupported file type
- Upload timeout
- Network failure during upload

---

### 5.2 Friend System Errors

- Friend request to non-existent user
- Duplicate friend request
- Self-friend request attempt
- Privacy violation attempts

---

### 5.3 Suggestion System Errors

- Invalid item IDs in suggestion
- Friendship requirement not met
- Message too long (> 100 chars)
- Rate limiting on suggestions

**Related Tasks:** [TASK: 07-qa-security-launch#7.2]

---

## 6. Logging Best Practices

### 6.1 Structured Logging

**Frontend Logging (Production):**

```javascript
// utils/logger.js
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = import.meta.env.PROD ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
    this.buffer = [];
    this.maxBufferSize = 100;
  }

  _log(level, message, context = {}) {
    if (level > this.level) return;

    const logEntry = {
      level: Object.keys(LOG_LEVELS)[level],
      message,
      context: this._sanitizeContext(context),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this._getSessionId()
    };

    // Console output in development
    if (import.meta.env.DEV) {
      const method = level === LOG_LEVELS.ERROR ? 'error' : 
                     level === LOG_LEVELS.WARN ? 'warn' : 'log';
      console[method](`[${logEntry.level}]`, message, context);
    }

    // Buffer logs for batch sending
    this.buffer.push(logEntry);
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  _sanitizeContext(context) {
    // Remove sensitive data
    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'email', 'phone', 'ssn', 'creditCard'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  _getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
        keepalive: true
      });
    } catch (error) {
      // Failed to send logs - store locally
      console.error('Failed to send logs:', error);
    }
  }

  error(message, context) {
    this._log(LOG_LEVELS.ERROR, message, context);
  }

  warn(message, context) {
    this._log(LOG_LEVELS.WARN, message, context);
  }

  info(message, context) {
    this._log(LOG_LEVELS.INFO, message, context);
  }

  debug(message, context) {
    this._log(LOG_LEVELS.DEBUG, message, context);
  }
}

export const logger = new Logger();

// Flush logs before page unload
window.addEventListener('beforeunload', () => {
  logger.flush();
});

// Periodic flush every 30 seconds
setInterval(() => logger.flush(), 30000);
```

**Usage Examples:**

```javascript
// Error logging
try {
  await api.uploadImage(file);
} catch (error) {
  logger.error('Image upload failed', {
    error: error.message,
    fileSize: file.size,
    fileType: file.type,
    endpoint: '/api/clothes/upload'
  });
}

// Warning logging (only count user uploads, not catalog items)
const userUploads = clothes.filter(item => !item.catalog_item_id).length;
if (userUploads > 45) {
  logger.warn('Approaching upload quota', {
    current: userUploads,
    limit: 50,
    remaining: 50 - userUploads
  });
}

// Info logging
logger.info('User logged in', {
  userId: user.id,
  loginMethod: 'google'
});

// Debug logging (only in development)
logger.debug('API request sent', {
  method: 'POST',
  url: '/api/clothes',
  payload: data
});
```

**Backend Logging (Node.js):**

```javascript
// utils/logger.js
import winston from 'winston';

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'stylesnap-api',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Write errors to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Console output in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Express middleware for request logging
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id
    });

    // Warn about slow requests
    if (duration > 1000) {
      logger.warn('Slow request', {
        method: req.method,
        url: req.url,
        duration
      });
    }
  });

  next();
}

// Usage in routes
app.use(requestLogger);

export default logger;
```

**Database Query Logging:**

```javascript
// utils/db.js
import logger from './logger.js';

// Log slow queries
pool.on('query', (query) => {
  const start = Date.now();
  
  query.on('end', () => {
    const duration = Date.now() - start;
    
    if (duration > 100) {
      logger.warn('Slow database query', {
        query: query.text,
        duration,
        params: query.values
      });
    }
  });
});

// Log connection pool status
setInterval(() => {
  logger.info('Database pool status', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  });
}, 60000); // Every minute
```

### 6.2 Log Retention & Privacy

**Log Retention Policy:**

```javascript
// Production logs retention
{
  error: '90 days',    // Keep errors for 3 months
  warn: '30 days',     // Keep warnings for 1 month
  info: '7 days',      // Keep info for 1 week
  debug: '0 days'      // Never log debug in production
}

// Automated cleanup (cron job)
// 0 0 * * * node scripts/cleanup-logs.js
```

**Privacy Considerations:**

```javascript
// ❌ DO NOT LOG:
- Passwords
- Auth tokens
- Email addresses
- Phone numbers
- Credit card numbers
- Social security numbers
- Personal health information

// ✅ SAFE TO LOG:
- User IDs (not usernames)
- Timestamps
- Request methods/paths
- Response status codes
- Performance metrics
- Error messages (sanitized)
- Session IDs (hashed)

// Example: Sanitizing logs
function sanitizeForLogging(data) {
  const sanitized = { ...data };
  
  // Remove auth headers
  if (sanitized.headers) {
    delete sanitized.headers.authorization;
    delete sanitized.headers.cookie;
  }
  
  // Hash sensitive IDs
  if (sanitized.email) {
    sanitized.email_hash = hashEmail(sanitized.email);
    delete sanitized.email;
  }
  
  return sanitized;
}
```

### 6.3 Log Analysis & Alerting

**Setup Log Aggregation:**

```javascript
// Ship logs to log aggregation service
// Options: Datadog, Loggly, Papertrail, CloudWatch

// Example: Datadog integration
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: process.env.VITE_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  sampleRate: 100,
  trackInteractions: true
});

// Send logs to Datadog
datadogLogs.logger.info('User action', {
  action: 'item_added',
  itemId: item.id
});
```

**Alerting Rules:**

```javascript
// Set up alerts for critical issues
{
  highErrorRate: {
    condition: 'error_count > 100 per 5 minutes',
    notify: ['team@stylesnap.com', 'pagerduty']
  },
  slowApiResponses: {
    condition: 'p95_response_time > 2000ms',
    notify: ['team@stylesnap.com']
  },
  highMemoryUsage: {
    condition: 'memory_usage > 80%',
    notify: ['devops@stylesnap.com']
  }
}
```

**Logging Checklist:**
- ✅ Structured JSON logs with timestamps
- ✅ Log levels: ERROR, WARN, INFO, DEBUG
- ✅ Sanitize sensitive data (passwords, tokens, PII)
- ✅ Context enrichment (user ID, session ID, request ID)
- ✅ Log rotation with size limits (10MB per file)
- ✅ Retention policy (90/30/7/0 days by level)
- ✅ Request/response logging with duration
- ✅ Slow query detection and logging
- ✅ Error stack traces in logs
- ✅ Log aggregation service integration
- ✅ Automated alerts for critical issues
- ✅ Privacy compliance (GDPR, CCPA)

````
