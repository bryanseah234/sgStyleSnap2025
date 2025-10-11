# Security Requirements

## 1. Frontend Security

### 1.1 Input Validation

- Sanitize all user inputs before API calls
- Use DOMPurify for HTML sanitization
- Validate email formats client-side
- Escape dynamic content in templates
- Use v-text instead of v-html where possible

**ISSUE #39 FIX: Comprehensive XSS Prevention**

**Understanding XSS Vulnerabilities:**

Cross-Site Scripting (XSS) occurs when attacker-controlled data is rendered as code:

```javascript
// ❌ DANGEROUS - XSS vulnerable
const username = req.body.username; // User input: <script>alert('XSS')</script>
element.innerHTML = `Welcome ${username}!`; // Executes malicious script!

// ❌ DANGEROUS in Vue
<div v-html="userMessage"></div> // If userMessage contains <script>, it executes!

// ✅ SAFE in Vue (auto-escaped)
<div>{{ userMessage }}</div> // Vue automatically escapes HTML entities
<div v-text="userMessage"></div> // Also safe, explicit text-only
```

**DOMPurify Configuration:**

```javascript
import DOMPurify from 'dompurify';

// Strict configuration (recommended for user-generated content)
const strictConfig = {
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [], // No attributes allowed
  KEEP_CONTENT: true // Keep text content
};

// Basic configuration (for formatted content)
const basicConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOWED_URI_REGEXP: /^https?:\/\//,  // Only HTTP(S) links
  ALLOW_DATA_ATTR: false
};

// Usage
function sanitizeUserInput(input) {
  return DOMPurify.sanitize(input, strictConfig);
}

// For suggestion messages (no HTML needed)
function sanitizeSuggestionMessage(message) {
  return DOMPurify.sanitize(message, strictConfig);
}

// For future features that might need basic formatting
function sanitizeFormattedContent(content) {
  return DOMPurify.sanitize(content, basicConfig);
}
```

**Vue Template Safety:**

```vue
<!-- ✅ SAFE - Automatic escaping -->
<template>
  <div>
    <h2>{{ item.name }}</h2> <!-- Safe -->
    <p>{{ item.description }}</p> <!-- Safe -->
    <span>{{ userMessage }}</span> <!-- Safe -->
  </div>
</template>

<!-- ✅ SAFE - Explicit text-only -->
<template>
  <div>
    <div v-text="item.name"></div> <!-- Safe -->
    <div v-text="userBio"></div> <!-- Safe -->
  </div>
</template>

<!-- ❌ DANGEROUS - Avoid unless absolutely necessary -->
<template>
  <div>
    <!-- Only if content is from trusted source AND sanitized -->
    <div v-html="sanitizedContent"></div>
  </div>
</template>

<script setup>
import DOMPurify from 'dompurify';

const sanitizedContent = computed(() => {
  // Only use v-html with sanitized content
  return DOMPurify.sanitize(props.content, strictConfig);
});
</script>
```

**Attribute Injection Prevention:**

```vue
<!-- ❌ DANGEROUS - Attribute injection -->
<a :href="userProvidedUrl">Link</a>
<!-- If userProvidedUrl is "javascript:alert('XSS')" - DANGEROUS! -->

<!-- ✅ SAFE - Validate URL scheme -->
<template>
  <a :href="safeUrl">Link</a>
</template>

<script setup>
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    // Only allow http(s) protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

const safeUrl = computed(() => {
  if (isValidUrl(props.url)) {
    return props.url;
  }
  return '#'; // Fallback to safe default
});
</script>

<!-- ✅ SAFE - Use rel="noopener noreferrer" for external links -->
<a :href="externalUrl" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

**Input Sanitization in Forms:**

```javascript
// Sanitize before sending to API
const formData = {
  name: DOMPurify.sanitize(name.value.trim(), strictConfig),
  description: DOMPurify.sanitize(description.value.trim(), strictConfig),
  message: DOMPurify.sanitize(message.value.trim(), strictConfig)
};

// Validate length after sanitization
if (formData.message.length > 100) {
  errors.push('Message too long');
}

// Server should also validate and sanitize!
```

**Server-Side Sanitization (Defense in Depth):**

```javascript
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Sanitize all user inputs
app.post('/api/clothes', authenticate, async (req, res) => {
  const sanitizedData = {
    name: purify.sanitize(req.body.name, { ALLOWED_TAGS: [] }),
    category: req.body.category, // Enum, validated separately
    size: purify.sanitize(req.body.size, { ALLOWED_TAGS: [] }),
    brand: purify.sanitize(req.body.brand, { ALLOWED_TAGS: [] })
  };
  
  // Additional validation
  if (sanitizedData.name.length > 255) {
    return res.status(400).json({ error: 'Name too long' });
  }
  
  // Insert into database (parameterized query - safe from SQL injection)
  const { data, error } = await supabase
    .from('clothes')
    .insert(sanitizedData);
  
  res.json(data);
});
```

**Dangerous Patterns to Avoid:**

```javascript
// ❌ NEVER do this
eval(userInput); // Executes arbitrary code
new Function(userInput)(); // Same as eval
dangerouslySetInnerHTML={{ __html: userInput }}; // React equivalent

// ❌ NEVER construct HTML strings with user input
const html = `<div>${userInput}</div>`; // XSS vulnerable
element.innerHTML = html;

// ❌ NEVER use user input in script tags
<script>
  const data = ${JSON.stringify(userInput)}; // Can escape script context
</script>

// ✅ CORRECT way
<script>
  const data = JSON.parse(document.getElementById('data').textContent);
</script>
<script id="data" type="application/json">
  <%= JSON.stringify(sanitizedData) %>
</script>
```

**CSP Nonce for Inline Scripts (most secure):**

```vue
<!-- Server-side template -->
<template>
  <div id="app"></div>
  <script :nonce="cspNonce">
    // Inline script allowed only with correct nonce
    window.__INITIAL_STATE__ = <%= JSON.stringify(sanitizedState) %>;
  </script>
  <script :nonce="cspNonce" src="/main.js"></script>
</template>

<script setup>
// Nonce generated server-side per request
const cspNonce = inject('cspNonce');
</script>
```

**Content Security Policy with XSS Protection:**

```javascript
// Strict CSP prevents inline scripts entirely
const csp = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{{NONCE}}'", // No 'unsafe-inline'
  "style-src 'self' 'nonce-{{NONCE}}'",
  "object-src 'none'",
  "base-uri 'self'"
].join('; ');

// This CSP would block:
// - Inline <script> tags without nonce
// - javascript: URLs
// - Inline event handlers (onclick, onerror)
// - eval() and new Function()
```

**Testing for XSS:**

```javascript
// XSS test payloads
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')">',
  '" onclick="alert(\'XSS\')" "',
  '\u003cscript\u003ealert("XSS")\u003c/script\u003e' // Unicode encoded
];

// Test that all are safely handled
xssPayloads.forEach(payload => {
  const sanitized = DOMPurify.sanitize(payload, strictConfig);
  console.assert(
    !sanitized.includes('<script>') && !sanitized.includes('alert'),
    `XSS payload not properly sanitized: ${payload}`
  );
});
```

**XSS Prevention Checklist:**

- ✅ Use `{{ }}` or `v-text` for user content (auto-escaped)
- ✅ Avoid `v-html` unless absolutely necessary
- ✅ Sanitize with DOMPurify before using `v-html`
- ✅ Validate URL schemes in `href` attributes
- ✅ Use `rel="noopener noreferrer"` for external links
- ✅ Implement strict Content Security Policy
- ✅ Sanitize on both client AND server (defense in depth)
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Validate input lengths and formats
- ✅ Test with common XSS payloads
- ❌ Never use `eval()` or `new Function()` with user input
- ❌ Never construct HTML strings with user input
- ❌ Never trust client-side validation alone
- ❌ Never disable XSS protections for convenience

---

### 1.2 Authentication Security

**CRITICAL: Google SSO Only**
- **Authentication Method:** Google OAuth 2.0 (Single Sign-On) ONLY
- No email/password authentication
- No magic links or other auth methods
- Google OAuth configured in Supabase Auth settings
- Secrets stored in `.env` file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Token Management:**
- Never store JWT in localStorage (XSS vulnerability)
- Use Supabase Auth built-in secure storage (IndexedDB with localStorage fallback)
- Implement automatic token refresh mechanism
- Clear sensitive data on logout
- Add auth checks to route guards

**ISSUE #35 FIX: Secure JWT Token Storage Implementation**

**Why NOT localStorage:**

```javascript
// ❌ NEVER DO THIS - Vulnerable to XSS attacks
localStorage.setItem('jwt_token', token); // Any script can access this!

// ❌ NEVER DO THIS EITHER
sessionStorage.setItem('jwt_token', token); // Still vulnerable to XSS
```

**Recommended: Supabase Auth Built-in Storage**

Supabase Auth automatically handles secure token storage using:
- **First choice:** IndexedDB (encrypted, not accessible via JavaScript)
- **Fallback:** localStorage (only if IndexedDB unavailable)
- **Automatic refresh:** Tokens refreshed before expiration

```javascript
// ✅ RECOMMENDED - Use Supabase Auth Client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: window.localStorage, // Supabase manages this securely
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});

// Get current session (token managed automatically)
const { data: { session } } = await supabase.auth.getSession();

// Token is automatically included in all Supabase API calls
const { data: items } = await supabase
  .from('clothes')
  .select('*');
```

**Alternative: Memory-Only Storage (Most Secure)**

```javascript
// ✅ MOST SECURE - Memory-only storage
class SecureTokenStore {
  constructor() {
    this._token = null;
    this._refreshToken = null;
  }

  setTokens(accessToken, refreshToken) {
    this._token = accessToken;
    this._refreshToken = refreshToken;
  }

  getToken() {
    return this._token;
  }

  getRefreshToken() {
    return this._refreshToken;
  }

  clear() {
    this._token = null;
    this._refreshToken = null;
  }
}

const tokenStore = new SecureTokenStore();

// Drawback: User must re-authenticate on page refresh
// Solution: Use refresh token stored in httpOnly cookie
```

**Alternative: HttpOnly Cookies (Server-Side Required)**

```javascript
// ✅ SECURE - Requires backend server
// Server sets httpOnly cookie after authentication
res.cookie('access_token', token, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // Only sent over HTTPS
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000      // 1 hour
});

// Client doesn't handle tokens directly
// Server automatically includes cookie in requests
fetch('/api/clothes', {
  credentials: 'include' // Include cookies
});
```

**Token Refresh Implementation:**

```javascript
// Automatic token refresh with Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed automatically');
  }
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    store.clearUserData();
  }
});

// Manual refresh if needed
async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    // Redirect to login
    router.push('/login');
  }
}
```

**Logout Security:**

```javascript
async function secureLogout() {
  // 1. Sign out from Supabase (clears tokens)
  await supabase.auth.signOut();
  
  // 2. Clear Pinia stores
  const authStore = useAuthStore();
  const closetStore = useClosetStore();
  authStore.$reset();
  closetStore.$reset();
  
  // 3. Clear any local caches
  localStorage.removeItem('user_preferences');
  sessionStorage.clear();
  
  // 4. Redirect to login
  router.push('/login');
}
```

**Route Guard Implementation:**

```javascript
// In router/index.js
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (to.meta.requiresAuth && !session) {
    // Not authenticated, redirect to login
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else if (to.path === '/login' && session) {
    // Already authenticated, redirect to app
    next('/closet');
  } else {
    next();
  }
});
```

**Security Checklist:**

- ✅ Use Supabase Auth's built-in secure storage (recommended)
- ✅ Never access tokens directly in application code
- ✅ Implement automatic token refresh
- ✅ Clear all data on logout
- ✅ Protect routes with auth guards
- ✅ Handle token expiration gracefully
- ✅ Use HTTPS in production (required)
- ❌ Never log tokens to console
- ❌ Never store tokens in localStorage manually
- ❌ Never pass tokens in URL parameters

---

### 1.3 API Security

- Always use HTTPS for API calls
- Include CSRF tokens where applicable
- Implement request rate limiting
- Validate file types before upload
- Check file size client-side

---

### 1.4 Environment Variables

```javascript
// Client-side environment variables (Vite)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_CLOUDINARY_CLOUD_NAME=xxx
VITE_CLOUDINARY_UPLOAD_PRESET=xxx
VITE_GOOGLE_CLIENT_ID=xxx

// Server-side environment variables (never expose)
SUPABASE_SERVICE_KEY=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## 2. Content Security Policy

**ISSUE #36 FIX: Complete CSP Headers Configuration**

**Production-Ready CSP (Strict):**

```javascript
// In vite.config.js or hosting platform (Vercel/Netlify)
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{{NONCE}}' https://accounts.google.com https://apis.google.com",
  "style-src 'self' 'nonce-{{NONCE}}' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' https://res.cloudinary.com https://lh3.googleusercontent.com data: blob:",
  "media-src 'self' https://res.cloudinary.com",
  "connect-src 'self' https://*.supabase.co https://api.cloudinary.com https://accounts.google.com",
  "frame-src 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests"
].join('; ');

// For Vite (vite.config.js)
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': cspHeader,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
});
```

**CSP Directives Explained:**

| Directive | Purpose | Configuration |
|-----------|---------|---------------|
| `default-src 'self'` | Default policy for all resources | Only same origin |
| `script-src` | JavaScript sources | Self + nonce + Google OAuth |
| `style-src` | CSS sources | Self + nonce + Google Fonts |
| `font-src` | Font sources | Self + Google Fonts CDN |
| `img-src` | Image sources | Self + Cloudinary + Google avatars + data/blob URIs |
| `media-src` | Video/audio sources | Self + Cloudinary |
| `connect-src` | Fetch/XHR destinations | Self + Supabase + Cloudinary + Google |
| `frame-src` | Iframe sources | Self + Google OAuth popup |
| `frame-ancestors` | Embedding restrictions | None (prevents clickjacking) |
| `form-action` | Form submission targets | Self only |
| `base-uri` | Base tag restrictions | Self only |
| `object-src` | Plugin restrictions | None (no Flash/Java) |
| `upgrade-insecure-requests` | Force HTTPS | All HTTP → HTTPS |

**Nonce-Based Script Execution (Recommended for Production):**

```javascript
// Server-side (if using SSR or backend)
import crypto from 'crypto';

app.use((req, res, next) => {
  // Generate unique nonce per request
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  // Set CSP with nonce
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://accounts.google.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    // ... other directives
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  next();
});

// In HTML template
<script nonce="{{nonce}}" src="/main.js"></script>
<style nonce="{{nonce}}">/* inline styles */</style>
```

**Development vs Production CSP:**

```javascript
// Development (relaxed for HMR)
const devCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // For Vite HMR
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' ws: wss:", // For Vite HMR websocket
  // ... other directives
].join('; ');

// Production (strict)
const prodCSP = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{{NONCE}}'", // No unsafe-inline!
  "style-src 'self' 'nonce-{{NONCE}}'",
  // ... other directives
].join('; ');

export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': import.meta.env.DEV ? devCSP : prodCSP
    }
  }
});
```

**Vercel Configuration (vercel.json):**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://res.cloudinary.com https://lh3.googleusercontent.com data: blob:; connect-src 'self' https://*.supabase.co https://api.cloudinary.com; frame-src https://accounts.google.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

**Testing CSP:**

```javascript
// 1. Use CSP report-only mode first (non-blocking)
"Content-Security-Policy-Report-Only": "default-src 'self'; report-uri /csp-report"

// 2. Check browser console for violations
// 3. Fix violations before enforcing
// 4. Switch to enforcing mode
"Content-Security-Policy": "default-src 'self'; ..."
```

**CSP Violation Reporting:**

```javascript
// Add report-uri or report-to directive
const csp = [
  "default-src 'self'",
  // ... other directives
  "report-uri /api/csp-report",
  "report-to csp-endpoint"
].join('; ');

// Backend endpoint to receive reports
app.post('/api/csp-report', (req, res) => {
  console.log('CSP Violation:', req.body);
  // Log to monitoring service
  res.status(204).end();
});
```

---

## 3. API Security Requirements

### 3.1 Authentication

- All endpoints require valid JWT token
- Implement request validation middleware
- Use parameterized queries (no string concatenation)
- Rate limit by user ID (5 requests/second)

**ISSUE #38 FIX: Detailed Rate Limiting Implementation**

**Rate Limiting Tiers:**

| Endpoint Type | Limit | Window | Penalty |
|--------------|-------|--------|----------|
| Authentication | 5 attempts | 15 min | 1 hour lockout after 5 failures |
| Friend Requests | 10 requests | 1 hour | 429 response |
| File Upload | 20 uploads | 1 hour | 429 response |
| API Reads (GET) | 100 requests | 1 min | 429 response |
| API Writes (POST/PUT) | 30 requests | 1 min | 429 response |
| Search/Filter | 60 requests | 1 min | 429 response |

**Implementation with Supabase (Database-Based):**

```sql
-- Create rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  endpoint VARCHAR(255),
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_lookup 
  ON rate_limits(user_id, endpoint, window_start);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint VARCHAR,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(
  allowed BOOLEAN,
  remaining INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;
  
  -- Get current count in window
  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_start > v_window_start;
  
  -- Check if limit exceeded
  IF v_current_count >= p_limit THEN
    RETURN QUERY SELECT 
      FALSE,
      0,
      (SELECT MIN(window_start) + (p_window_seconds || ' seconds')::INTERVAL
       FROM rate_limits
       WHERE user_id = p_user_id AND endpoint = p_endpoint);
  ELSE
    -- Increment counter
    INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, NOW())
    ON CONFLICT (user_id, endpoint, window_start) 
    DO UPDATE SET request_count = rate_limits.request_count + 1;
    
    RETURN QUERY SELECT 
      TRUE,
      p_limit - v_current_count - 1,
      NOW() + (p_window_seconds || ' seconds')::INTERVAL;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Middleware Implementation:**

```javascript
// Rate limiting middleware
import { supabase } from './supabase.js';

const RATE_LIMITS = {
  'POST /api/friends/request': { limit: 10, window: 3600 },
  'POST /api/clothes': { limit: 20, window: 3600 },
  'GET /api/closet': { limit: 100, window: 60 },
  'POST /api/suggestions': { limit: 30, window: 60 }
};

export async function rateLimitMiddleware(req, res, next) {
  const userId = req.user?.id;
  const endpoint = `${req.method} ${req.path}`;
  
  // Get rate limit config for this endpoint
  const config = RATE_LIMITS[endpoint] || { limit: 60, window: 60 };
  
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_limit: config.limit,
      p_window_seconds: config.window
    });
    
    if (error) throw error;
    
    const result = data[0];
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.reset_at).toISOString());
    
    if (!result.allowed) {
      const retryAfter = Math.ceil(
        (new Date(result.reset_at) - new Date()) / 1000
      );
      
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after: retryAfter,
        reset_at: result.reset_at
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if rate limiting fails
    next();
  }
}

// Apply to routes
app.post('/api/friends/request', authenticate, rateLimitMiddleware, handleFriendRequest);
app.post('/api/clothes', authenticate, rateLimitMiddleware, handleCreateClothes);
```

**Redis-Based Implementation (More Performant):**

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Sliding window rate limiter
async function checkRateLimit(userId, endpoint, limit, windowSeconds) {
  const key = `ratelimit:${userId}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  
  const pipeline = redis.pipeline();
  
  // Remove old entries outside window
  pipeline.zremrangebyscore(key, 0, windowStart);
  
  // Count requests in current window
  pipeline.zcard(key);
  
  // Add current request
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  
  // Set expiry
  pipeline.expire(key, windowSeconds);
  
  const results = await pipeline.exec();
  const count = results[1][1];
  
  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count - 1),
    resetAt: new Date(now + (windowSeconds * 1000))
  };
}

// Middleware
export async function rateLimitMiddleware(req, res, next) {
  const userId = req.user?.id || req.ip; // Fall back to IP for unauthenticated
  const endpoint = `${req.method}:${req.path}`;
  const config = RATE_LIMITS[endpoint] || { limit: 60, window: 60 };
  
  const result = await checkRateLimit(
    userId,
    endpoint,
    config.limit,
    config.window
  );
  
  res.setHeader('X-RateLimit-Limit', config.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
  
  if (!result.allowed) {
    const retryAfter = Math.ceil(
      (result.resetAt - new Date()) / 1000
    );
    
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retry_after: retryAfter
    });
  }
  
  next();
}
```

**IP-Based Rate Limiting (for unauthenticated endpoints):**

```javascript
// For login/signup endpoints
export function ipRateLimitMiddleware(limit, windowSeconds) {
  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const endpoint = req.path;
    
    const result = await checkRateLimit(ip, endpoint, limit, windowSeconds);
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too many attempts. Please try again later.'
      });
    }
    
    next();
  };
}

// Apply to auth endpoints
app.post('/api/auth/login', 
  ipRateLimitMiddleware(5, 900), // 5 attempts per 15 minutes
  handleLogin
);
```

**Dynamic Rate Limiting (based on user tier):**

```javascript
function getRateLimit(user, endpoint) {
  const baseLimit = RATE_LIMITS[endpoint];
  
  // Premium users get higher limits
  if (user.tier === 'premium') {
    return {
      limit: baseLimit.limit * 2,
      window: baseLimit.window
    };
  }
  
  return baseLimit;
}
```

**Bypass for Internal Services:**

```javascript
export async function rateLimitMiddleware(req, res, next) {
  // Bypass rate limiting for internal service accounts
  if (req.headers['x-service-token'] === process.env.INTERNAL_SERVICE_TOKEN) {
    return next();
  }
  
  // ... normal rate limiting
}
```

**Monitoring and Alerting:**

```javascript
// Log rate limit violations
if (!result.allowed) {
  console.warn('Rate limit exceeded', {
    userId,
    endpoint,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Alert if excessive violations (potential attack)
  const violationCount = await countRecentViolations(userId);
  if (violationCount > 10) {
    alertSecurityTeam({
      type: 'EXCESSIVE_RATE_LIMIT_VIOLATIONS',
      userId,
      count: violationCount
    });
  }
}
```

---

### 3.2 Data Access Control

- Verify user ownership for all resource operations
- Implement proper Row Level Security policies
- Never expose private items through friend endpoints
- Validate friendship status before sharing data

---

### 3.3 File Upload Security

- Validate file types (images only)
- Scan for malicious content
- Limit file size server-side
- Use signed upload URLs when possible

**ISSUE #37 FIX: Comprehensive File Upload Security**

**Multi-Layer Validation Strategy:**

```
Client → Server → Cloudinary → Storage
  ↓        ↓           ↓          ↓
Size    Magic #    Transform   Virus
Type    Scan       Strip EXIF  Scan
```

**Layer 1: Client-Side Validation (First Defense)**

```javascript
// File type whitelist
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB before compression

function validateFile(file) {
  const errors = [];
  
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push('Only JPEG, PNG, and WebP images are allowed');
  }
  
  // Check file size
  if (file.size > MAX_SIZE) {
    errors.push(`File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
  }
  
  // Check file name for suspicious patterns
  if (file.name.match(/\.(php|exe|sh|bat|cmd)$/i)) {
    errors.push('Invalid file name');
  }
  
  return errors;
}
```

**Layer 2: Magic Number Validation (Server-Side)**

Don't trust the file extension or MIME type - check the actual file content:

```javascript
// Magic numbers (file signatures) for image types
const MAGIC_NUMBERS = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46] // RIFF
};

async function verifyImageType(buffer) {
  const header = Array.from(buffer.slice(0, 4));
  
  for (const [type, signature] of Object.entries(MAGIC_NUMBERS)) {
    if (signature.every((byte, i) => header[i] === byte)) {
      return type;
    }
  }
  
  throw new Error('Invalid image file - magic number mismatch');
}

// Usage with Cloudinary upload
import Busboy from 'busboy';
import { Readable } from 'stream';

app.post('/api/upload', async (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  
  busboy.on('file', async (fieldname, file, info) => {
    const { filename, encoding, mimeType } = info;
    
    // Read first chunk to verify magic number
    const chunks = [];
    for await (const chunk of file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Verify magic number
    const actualType = await verifyImageType(buffer);
    if (actualType !== mimeType) {
      return res.status(400).json({ error: 'File type mismatch' });
    }
    
    // Continue with upload...
  });
  
  req.pipe(busboy);
});
```

**Layer 3: EXIF Data Stripping**

Remove potentially sensitive metadata from images:

```javascript
// Using Cloudinary transformations to strip EXIF
const cloudinaryOptions = {
  folder: 'stylesnap/clothes',
  transformation: [
    {
      quality: 'auto',
      fetch_format: 'auto'
    },
    {
      // Strip all metadata including EXIF, GPS, camera info
      flags: 'strip_profile'
    }
  ],
  // Additional security
  invalidate: true, // Invalidate CDN cache
  resource_type: 'image',
  allowed_formats: ['jpg', 'png', 'webp']
};

// Or use sharp library server-side
import sharp from 'sharp';

async function stripMetadata(buffer) {
  return await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .withMetadata({
      // Remove all metadata except orientation
      exif: {},
      icc: undefined
    })
    .toBuffer();
}
```

**Layer 4: Virus Scanning**

**Option A: ClamAV Integration (Self-Hosted)**

```javascript
import NodeClam from 'clamscan';

const clamscan = await new NodeClam().init({
  clamdscan: {
    host: 'localhost',
    port: 3310
  }
});

async function scanFile(filePath) {
  const { isInfected, viruses } = await clamscan.scanFile(filePath);
  
  if (isInfected) {
    console.error('Virus detected:', viruses);
    throw new Error('File failed security scan');
  }
  
  return true;
}

// In upload handler
app.post('/api/upload', async (req, res) => {
  const tempPath = `/tmp/${uuid()}`;
  
  // Save file temporarily
  await saveFile(req, tempPath);
  
  try {
    // Scan for viruses
    await scanFile(tempPath);
    
    // Upload to Cloudinary if clean
    const result = await cloudinary.uploader.upload(tempPath);
    
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(400).json({ error: 'File failed security scan' });
  } finally {
    // Always delete temp file
    fs.unlinkSync(tempPath);
  }
});
```

**Option B: Third-Party Scanning Service**

```javascript
// Using VirusTotal API
import axios from 'axios';

async function scanWithVirusTotal(fileBuffer) {
  const formData = new FormData();
  formData.append('file', fileBuffer);
  
  const { data } = await axios.post(
    'https://www.virustotal.com/api/v3/files',
    formData,
    {
      headers: {
        'x-apikey': process.env.VIRUSTOTAL_API_KEY
      }
    }
  );
  
  // Check scan results
  const analysisUrl = data.data.links.self;
  // Poll for results...
}
```

**Cloudinary Signed Upload (Recommended):**

```javascript
// Server-side: Generate signed upload parameters
import cloudinary from 'cloudinary';
import crypto from 'crypto';

app.post('/api/get-upload-signature', async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const userId = req.user.id;
  
  const params = {
    timestamp,
    folder: `stylesnap/${userId}`,
    allowed_formats: 'jpg,png,webp',
    max_file_size: 10485760, // 10MB
    transformation: 'c_limit,w_1080,q_auto,f_auto',
    resource_type: 'image'
  };
  
  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: params.folder
  });
});

// Client-side: Use signed upload
async function uploadToCloudinary(file) {
  // Get signature from server
  const { data: signatureData } = await axios.post('/api/get-upload-signature');
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', signatureData.timestamp);
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder);
  
  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
    formData
  );
  
  return data.secure_url;
}
```

**Complete Secure Upload Workflow:**

```javascript
async function secureUploadWorkflow(file) {
  // 1. Client-side validation
  const errors = validateFile(file);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  // 2. Client-side compression (see Batch 4)
  const compressed = await compressImage(file);
  
  // 3. Get signed upload parameters
  const signatureData = await getUploadSignature();
  
  // 4. Upload to Cloudinary (signed)
  const cloudinaryUrl = await uploadToCloudinary(compressed, signatureData);
  
  // 5. Server validates and stores
  const { data: item } = await axios.post('/api/clothes', {
    name: itemName,
    image_url: cloudinaryUrl, // Server validates Cloudinary domain
    category: category
  });
  
  return item;
}
```

**Server-Side Validation:**

```javascript
// In POST /clothes endpoint
app.post('/api/clothes', authenticate, async (req, res) => {
  const { image_url } = req.body;
  
  // Validate URL is from Cloudinary
  const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/.+/;
  if (!cloudinaryPattern.test(image_url)) {
    return res.status(400).json({
      error: 'Invalid image URL - must be from Cloudinary'
    });
  }
  
  // Verify image exists and is accessible
  try {
    const response = await axios.head(image_url);
    const contentType = response.headers['content-type'];
    
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'URL does not point to an image' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Image URL is not accessible' });
  }
  
  // Continue with database insert...
});
```

**Security Checklist:**

- ✅ Client-side: File type and size validation
- ✅ Server-side: Magic number verification
- ✅ Strip EXIF data and metadata
- ✅ Virus scanning (ClamAV or third-party)
- ✅ Use signed uploads (prevent unauthorized uploads)
- ✅ Validate Cloudinary URLs on server
- ✅ Verify image is accessible before storing
- ✅ Rate limit upload endpoint
- ✅ Monitor for abuse patterns
- ❌ Never trust client-provided file extensions
- ❌ Never execute uploaded files
- ❌ Never serve uploaded files from same domain

---

## 4. Privacy Requirements

### 4.1 Data Classification

- **Public:** User name, public items (future feature)
- **Friends:** Items marked with 'friends' privacy
- **Private:** Items marked with 'private' privacy, email addresses
- **Anonymous:** Catalog items (no owner attribution)

---

### 4.2 Access Controls

- Users can only view their own private items
- Friends can only view friends' items with 'friends' privacy
- Never expose email addresses in friend searches
- Implement proper authorization checks

---

### 4.3 Anti-Scraping Measures (Friend Search)

**CRITICAL**: Prevent systematic enumeration of user database.

**Implemented Protections:**

- **Minimum Query Length:** Require 3+ characters (prevents iteration like 'a', 'b', 'c')
- **Rate Limiting:** Max 20 searches per user per minute (prevents automated scraping)
- **Result Limit:** Max 10 results per search (prevents full database extraction)
- **No Pagination:** Disable offset/pagination (prevents sequential scraping)
- **Random Ordering:** Return results in random order (prevents predictable enumeration)
- **Authentication Required:** Must be logged in (prevents anonymous scraping)
- **Email Hiding:** Never return email addresses in search results
- **Fuzzy Matching Only:** Use ILIKE for partial matches, no wildcards exposed
- **Timing Attack Prevention:** Use consistent response times regardless of results
- **No Result Count:** Never indicate total available results
- **Exact Email Match:** Email search only matches exact email, never returned in response

**Rate Limiting Implementation:**

```javascript
// Rate limit for user search
const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many search requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID for rate limiting (requires authentication)
  keyGenerator: (req) => req.user.id
});

// Apply to search endpoint
app.post('/api/users/search', authenticate, searchRateLimiter, handleSearch);
```

**Database Query Example:**

```sql
-- Secure search query with anti-scraping measures
SELECT 
  id, 
  name, 
  avatar_url,
  -- Never return email in search results
  NULL as email
FROM users
WHERE 
  -- Fuzzy name match OR exact email match
  (name ILIKE '%' || :query || '%' OR email = :query)
  -- Exclude self
  AND id != :current_user_id
  -- Exclude deleted users
  AND removed_at IS NULL
-- Random order prevents enumeration
ORDER BY RANDOM()
-- Hard limit prevents scraping
LIMIT 10;
```

**Monitoring for Scraping Attempts:**

- Log all search queries with user_id and timestamp
- Alert on:
  - Users hitting rate limit repeatedly
  - Systematic single-character searches ('a', 'b', 'c', etc.)
  - Sequential searches with predictable patterns
  - Searches from same IP across multiple accounts
- Implement progressive penalties:
  - First violation: Warning
  - Repeated violations: Temporary search ban (1 hour)
  - Persistent violations: Account review
- **CRITICAL**: Catalog items MUST be displayed anonymously
  - No owner_id in catalog API responses
  - No user attribution in catalog UI
  - Users cannot determine who uploaded catalog items (admin or other users)
  - catalog_items table has no owner_id column by design
- **Auto-Catalog Contribution**:
  - User uploads automatically added to catalog_items (background)
  - No user confirmation or prompt required
  - Catalog entry created without owner_id (anonymous)
  - Enables community-driven catalog growth
- **Smart Filtering**:
  - Catalog browse excludes items user already owns
  - Prevents duplicate suggestions
  - Uses catalog_item_id or image matching for detection

---

## 5. Security Monitoring

### 5.1 Logging

- Log all authentication attempts
- Track suspicious activities
- Monitor rate limit violations
- Log data access violations

---

### 5.2 Regular Audits

- Weekly security dependency updates
- Monthly security review of all endpoints
- Quarterly penetration testing
- Annual third-party security audit

**Related Tasks:** [TASK: 07-qa-security-launch#7.1]
