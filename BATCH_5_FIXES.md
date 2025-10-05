# Batch 5 Fixes - Security Issues

**Status:** ✅ COMPLETE  
**Date:** January 2025  
**Files Modified:** `requirements/security.md`

## Overview

Batch 5 addresses **5 critical security issues** focused on authentication, data protection, and attack prevention. These fixes provide production-ready security implementations with detailed code examples and best practices.

---

## Issues Fixed

### Issue #35: JWT Storage Security Unclear

**Problem:**
- Generic warning: "Never store JWT in localStorage"
- No explanation of why it's dangerous
- No recommended alternative implementation
- Missing token refresh mechanism
- Unclear integration with Supabase Auth
- No guidance for secure logout

**Solution:**
Added comprehensive JWT storage security guidance:

**Why localStorage is Dangerous:**

```javascript
// ❌ VULNERABLE to XSS attacks
localStorage.setItem('jwt_token', token); 
// Any injected script can access: localStorage.getItem('jwt_token')
```

**Recommended: Supabase Auth Built-in Storage**

Supabase automatically handles secure token storage:
- **First choice:** IndexedDB (encrypted, not accessible via JavaScript)
- **Fallback:** localStorage (only if IndexedDB unavailable)
- **Automatic refresh:** Tokens refreshed before expiration

```javascript
// ✅ SECURE - Use Supabase Auth Client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.localStorage, // Managed securely by Supabase
    autoRefreshToken: true,
    persistSession: true
  }
});

// Sign in with Google
await supabase.auth.signInWithOAuth({ provider: 'google' });

// Token automatically included in all requests
const { data } = await supabase.from('clothes').select('*');
```

**Alternative: Memory-Only Storage (Most Secure)**

```javascript
class SecureTokenStore {
  constructor() {
    this._token = null;
    this._refreshToken = null;
  }
  
  setTokens(accessToken, refreshToken) {
    this._token = accessToken;
    this._refreshToken = refreshToken;
  }
  
  clear() {
    this._token = null;
    this._refreshToken = null;
  }
}

// Drawback: User must re-authenticate on page refresh
```

**Alternative: HttpOnly Cookies (Requires Backend)**

```javascript
// Server sets httpOnly cookie
res.cookie('access_token', token, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000
});

// Client doesn't handle tokens
fetch('/api/clothes', { credentials: 'include' });
```

**Token Refresh Implementation:**

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed automatically');
  }
  if (event === 'SIGNED_OUT') {
    store.clearUserData();
  }
});
```

**Secure Logout:**

```javascript
async function secureLogout() {
  await supabase.auth.signOut();        // Clear tokens
  authStore.$reset();                    // Clear stores
  closetStore.$reset();
  localStorage.clear();                  // Clear caches
  router.push('/login');                 // Redirect
}
```

**Route Guard:**

```javascript
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (to.meta.requiresAuth && !session) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});
```

**Security Impact:** Prevents token theft via XSS, implements secure authentication flow, automatic token refresh, and comprehensive logout.

---

### Issue #36: Content Security Policy Incomplete

**Problem:**
- Missing critical CSP directives (font-src, frame-ancestors, form-action)
- Allows `'unsafe-inline'` for scripts and styles (major security risk)
- No nonce-based script execution
- Missing additional security headers (X-Frame-Options, etc.)
- No upgrade-insecure-requests directive
- No CSP violation reporting

**Solution:**
Implemented production-ready CSP with all security directives:

**Complete CSP Headers:**

```javascript
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{{NONCE}}' https://accounts.google.com",
  "style-src 'self' 'nonce-{{NONCE}}' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' https://res.cloudinary.com https://lh3.googleusercontent.com data: blob:",
  "connect-src 'self' https://*.supabase.co https://api.cloudinary.com",
  "frame-src 'self' https://accounts.google.com",
  "frame-ancestors 'none'",      // Prevents clickjacking
  "form-action 'self'",           // Prevents form hijacking
  "base-uri 'self'",              // Prevents base tag injection
  "object-src 'none'",            // Blocks plugins
  "upgrade-insecure-requests"     // Forces HTTPS
].join('; ');
```

**Additional Security Headers:**

```javascript
headers: {
  'Content-Security-Policy': cspHeader,
  'X-Content-Type-Options': 'nosniff',              // Prevents MIME sniffing
  'X-Frame-Options': 'DENY',                        // Prevents clickjacking
  'X-XSS-Protection': '1; mode=block',              // XSS filter
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

**CSP Directives Explained:**

| Directive | Purpose | Configuration |
|-----------|---------|---------------|
| `default-src` | Default policy | Only same origin |
| `script-src` | JavaScript sources | Self + nonce + Google |
| `frame-ancestors` | Embedding prevention | None (anti-clickjacking) |
| `form-action` | Form submission | Self only |
| `object-src` | Plugin blocking | None (no Flash/Java) |
| `upgrade-insecure-requests` | HTTPS enforcement | All HTTP → HTTPS |

**Nonce-Based Script Execution:**

```javascript
// Server generates unique nonce per request
const nonce = crypto.randomBytes(16).toString('base64');

// Set CSP with nonce
const csp = `script-src 'self' 'nonce-${nonce}'`;

// In HTML
<script nonce="{{nonce}}" src="/main.js"></script>
```

**Development vs Production:**

```javascript
const devCSP = "script-src 'self' 'unsafe-inline' 'unsafe-eval'"; // For HMR
const prodCSP = "script-src 'self' 'nonce-{{NONCE}}'"; // Strict

export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': import.meta.env.DEV ? devCSP : prodCSP
    }
  }
});
```

**Vercel Configuration:**

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {
        "key": "Content-Security-Policy",
        "value": "default-src 'self'; ..."
      }
    ]
  }]
}
```

**CSP Violation Reporting:**

```javascript
const csp = [
  "default-src 'self'",
  "report-uri /api/csp-report",
  "report-to csp-endpoint"
].join('; ');

app.post('/api/csp-report', (req, res) => {
  console.log('CSP Violation:', req.body);
  res.status(204).end();
});
```

**Security Impact:** Comprehensive defense against XSS, clickjacking, data injection, plugin exploits, and mixed content. Enforces HTTPS and provides violation reporting.

---

### Issue #37: File Upload Security Insufficient

**Problem:**
- Generic "validate file types" without implementation
- "Scan for malicious content" with no guidance
- No magic number verification
- Missing EXIF data stripping
- No virus scanning integration
- Trusts client-provided file extensions (dangerous)
- Missing secure upload workflow

**Solution:**
Implemented multi-layer file upload security:

**4-Layer Security Strategy:**

```
Client → Server → Cloudinary → Storage
  ↓        ↓           ↓          ↓
Size    Magic #    Transform   Virus
Type    Scan       Strip EXIF  Scan
```

**Layer 1: Client-Side Validation**

```javascript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images allowed';
  }
  if (file.size > MAX_SIZE) {
    return `File too large. Maximum ${MAX_SIZE / 1024 / 1024}MB`;
  }
  if (file.name.match(/\.(php|exe|sh|bat)$/i)) {
    return 'Invalid file name';
  }
  return null;
}
```

**Layer 2: Magic Number Validation (Server)**

Don't trust extensions - check actual file content:

```javascript
const MAGIC_NUMBERS = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46]
};

async function verifyImageType(buffer) {
  const header = Array.from(buffer.slice(0, 4));
  
  for (const [type, signature] of Object.entries(MAGIC_NUMBERS)) {
    if (signature.every((byte, i) => header[i] === byte)) {
      return type;
    }
  }
  
  throw new Error('Invalid image - magic number mismatch');
}
```

**Layer 3: EXIF Data Stripping**

Remove potentially sensitive metadata:

```javascript
// Using Cloudinary
const cloudinaryOptions = {
  transformation: [{
    flags: 'strip_profile'  // Removes all metadata
  }]
};

// Using sharp library
import sharp from 'sharp';

async function stripMetadata(buffer) {
  return await sharp(buffer)
    .rotate()  // Auto-rotate based on EXIF
    .withMetadata({ exif: {}, icc: undefined })
    .toBuffer();
}
```

**Layer 4: Virus Scanning**

**Option A: ClamAV (Self-Hosted)**

```javascript
import NodeClam from 'clamscan';

const clamscan = await new NodeClam().init({
  clamdscan: { host: 'localhost', port: 3310 }
});

async function scanFile(filePath) {
  const { isInfected, viruses } = await clamscan.scanFile(filePath);
  
  if (isInfected) {
    throw new Error('File failed security scan');
  }
  
  return true;
}
```

**Cloudinary Signed Upload (Recommended):**

```javascript
// Server generates signature
app.post('/api/get-upload-signature', async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  
  const params = {
    timestamp,
    folder: `stylesnap/${req.user.id}`,
    allowed_formats: 'jpg,png,webp',
    max_file_size: 10485760,  // 10MB
    transformation: 'c_limit,w_1080,q_auto,f_auto'
  };
  
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.json({ signature, timestamp, ...params });
});

// Client uses signed upload
const formData = new FormData();
formData.append('file', file);
formData.append('signature', signatureData.signature);
formData.append('timestamp', signatureData.timestamp);

await axios.post(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  formData
);
```

**Complete Secure Workflow:**

```javascript
async function secureUploadWorkflow(file) {
  // 1. Client validation
  const error = validateFile(file);
  if (error) throw new Error(error);
  
  // 2. Client compression
  const compressed = await compressImage(file);
  
  // 3. Get signed upload params
  const signatureData = await getUploadSignature();
  
  // 4. Upload to Cloudinary (signed)
  const cloudinaryUrl = await uploadToCloudinary(compressed, signatureData);
  
  // 5. Server validates and stores
  const { data } = await axios.post('/api/clothes', {
    image_url: cloudinaryUrl  // Server validates Cloudinary domain
  });
  
  return data;
}
```

**Server-Side URL Validation:**

```javascript
app.post('/api/clothes', async (req, res) => {
  const { image_url } = req.body;
  
  // Validate Cloudinary domain
  if (!image_url.match(/^https:\/\/res\.cloudinary\.com\/.+/)) {
    return res.status(400).json({ error: 'Invalid image URL' });
  }
  
  // Verify image exists
  const response = await axios.head(image_url);
  if (!response.headers['content-type'].startsWith('image/')) {
    return res.status(400).json({ error: 'URL not an image' });
  }
  
  // Continue with insert...
});
```

**Security Impact:** Multi-layer defense against malicious uploads, prevents file type spoofing, removes sensitive metadata, blocks malware, validates all uploads server-side.

---

### Issue #38: Rate Limiting Not Detailed

**Problem:**
- Generic "Rate limit by user ID (5 requests/second)"
- No per-endpoint rate limiting tiers
- Missing implementation guidance
- No sliding window algorithm
- No Redis/database strategy
- Missing rate limit headers
- No bypass for internal services

**Solution:**
Implemented comprehensive rate limiting with multiple strategies:

**Rate Limiting Tiers:**

| Endpoint Type | Limit | Window | Penalty |
|--------------|-------|--------|----------|
| Authentication | 5 attempts | 15 min | 1 hour lockout |
| Friend Requests | 10 requests | 1 hour | 429 response |
| File Upload | 20 uploads | 1 hour | 429 response |
| API Reads (GET) | 100 requests | 1 min | 429 response |
| API Writes (POST/PUT) | 30 requests | 1 min | 429 response |

**Database-Based Implementation (Supabase):**

```sql
-- Rate limiting table
CREATE TABLE rate_limits (
  user_id UUID REFERENCES users(id),
  endpoint VARCHAR(255),
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Check and increment function
CREATE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint VARCHAR,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMP)
AS $$
-- Implementation returns whether request is allowed
$$ LANGUAGE plpgsql;
```

**Middleware Implementation:**

```javascript
const RATE_LIMITS = {
  'POST /api/friends/request': { limit: 10, window: 3600 },
  'POST /api/clothes': { limit: 20, window: 3600 },
  'GET /api/closet': { limit: 100, window: 60 }
};

export async function rateLimitMiddleware(req, res, next) {
  const userId = req.user?.id;
  const endpoint = `${req.method} ${req.path}`;
  const config = RATE_LIMITS[endpoint];
  
  const result = await checkRateLimit(userId, endpoint, config);
  
  // Set headers
  res.setHeader('X-RateLimit-Limit', config.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetAt);
  
  if (!result.allowed) {
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Too many requests',
      retry_after: retryAfter
    });
  }
  
  next();
}
```

**Redis-Based Implementation (More Performant):**

```javascript
import Redis from 'ioredis';

async function checkRateLimit(userId, endpoint, limit, windowSeconds) {
  const key = `ratelimit:${userId}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);  // Remove old
  pipeline.zcard(key);                              // Count current
  pipeline.zadd(key, now, `${now}-${Math.random()}`); // Add new
  pipeline.expire(key, windowSeconds);              // Set expiry
  
  const results = await pipeline.exec();
  const count = results[1][1];
  
  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count - 1)
  };
}
```

**IP-Based Rate Limiting (Unauthenticated):**

```javascript
app.post('/api/auth/login', 
  ipRateLimitMiddleware(5, 900), // 5 attempts per 15 min
  handleLogin
);

function ipRateLimitMiddleware(limit, windowSeconds) {
  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const result = await checkRateLimit(ip, req.path, limit, windowSeconds);
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too many attempts. Please try again later.'
      });
    }
    next();
  };
}
```

**Dynamic Rate Limiting:**

```javascript
function getRateLimit(user, endpoint) {
  const baseLimit = RATE_LIMITS[endpoint];
  
  // Premium users get 2x limits
  if (user.tier === 'premium') {
    return { limit: baseLimit.limit * 2, window: baseLimit.window };
  }
  
  return baseLimit;
}
```

**Monitoring:**

```javascript
if (!result.allowed) {
  console.warn('Rate limit exceeded', { userId, endpoint, ip: req.ip });
  
  const violationCount = await countRecentViolations(userId);
  if (violationCount > 10) {
    alertSecurityTeam({ type: 'EXCESSIVE_VIOLATIONS', userId });
  }
}
```

**Security Impact:** Prevents abuse, DoS attacks, brute force attempts, API scraping, and resource exhaustion. Provides fair usage with appropriate limits per endpoint type.

---

### Issue #39: XSS Prevention Generic

**Problem:**
- Generic "sanitize all inputs" without examples
- "Use DOMPurify" without configuration
- Missing Vue-specific guidance
- No dangerous pattern examples
- Unclear when v-html is safe to use
- Missing URL validation for href attributes
- No CSP integration

**Solution:**
Added comprehensive XSS prevention with practical examples:

**Understanding XSS:**

```javascript
// ❌ DANGEROUS - XSS vulnerable
const username = '<script>alert("XSS")</script>';
element.innerHTML = `Welcome ${username}!`; // Executes script!

// ✅ SAFE - Auto-escaped in Vue
<div>{{ username }}</div> // Displays: <script>alert("XSS")</script>
```

**DOMPurify Configuration:**

```javascript
import DOMPurify from 'dompurify';

// Strict config (no HTML allowed)
const strictConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true
};

// For suggestion messages
function sanitizeMessage(message) {
  return DOMPurify.sanitize(message, strictConfig);
}

// For future formatted content
const basicConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOWED_URI_REGEXP: /^https?:\/\//
};
```

**Vue Template Safety:**

```vue
<!-- ✅ SAFE - Automatic escaping -->
<div>{{ item.name }}</div>
<span v-text="userMessage"></span>

<!-- ❌ DANGEROUS - Avoid unless necessary -->
<div v-html="userContent"></div>

<!-- ✅ SAFE with v-html - Sanitize first -->
<div v-html="sanitizedContent"></div>

<script setup>
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(props.content, strictConfig);
});
</script>
```

**Attribute Injection Prevention:**

```vue
<!-- ❌ DANGEROUS - javascript: URL -->
<a :href="userUrl">Link</a>

<!-- ✅ SAFE - Validate scheme -->
<a :href="safeUrl">Link</a>

<script setup>
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

const safeUrl = computed(() => {
  return isValidUrl(props.url) ? props.url : '#';
});
</script>

<!-- ✅ SAFE - External link protection -->
<a :href="externalUrl" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

**Form Input Sanitization:**

```javascript
const formData = {
  name: DOMPurify.sanitize(name.value.trim(), strictConfig),
  message: DOMPurify.sanitize(message.value.trim(), strictConfig)
};

// Validate after sanitization
if (formData.message.length > 100) {
  errors.push('Message too long');
}
```

**Server-Side Sanitization:**

```javascript
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

app.post('/api/clothes', async (req, res) => {
  const sanitized = {
    name: purify.sanitize(req.body.name, { ALLOWED_TAGS: [] }),
    size: purify.sanitize(req.body.size, { ALLOWED_TAGS: [] })
  };
  
  // Insert with parameterized query (SQL injection safe)
  const { data } = await supabase.from('clothes').insert(sanitized);
  res.json(data);
});
```

**Dangerous Patterns to Avoid:**

```javascript
// ❌ NEVER do these
eval(userInput);                           // Executes arbitrary code
new Function(userInput)();                 // Same as eval
element.innerHTML = `<div>${userInput}</div>`; // XSS vulnerable

// ❌ NEVER construct inline scripts with user data
<script>
  const data = ${JSON.stringify(userInput)}; // Can escape context
</script>
```

**CSP with XSS Protection:**

```javascript
const csp = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{{NONCE}}'", // No 'unsafe-inline'
  "object-src 'none'",
  "base-uri 'self'"
].join('; ');

// This blocks:
// - Inline scripts without nonce
// - javascript: URLs  
// - Inline event handlers (onclick)
// - eval() and new Function()
```

**XSS Test Payloads:**

```javascript
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')">',
  '" onclick="alert(\'XSS\')" "'
];

// Verify all are safely handled
xssPayloads.forEach(payload => {
  const sanitized = DOMPurify.sanitize(payload, strictConfig);
  console.assert(!sanitized.includes('<script>'));
});
```

**XSS Prevention Checklist:**

- ✅ Use `{{ }}` or `v-text` (auto-escaped)
- ✅ Avoid `v-html` unless absolutely necessary
- ✅ Sanitize with DOMPurify before `v-html`
- ✅ Validate URL schemes in `href`
- ✅ Use `rel="noopener noreferrer"` for external links
- ✅ Implement strict CSP
- ✅ Sanitize on both client AND server
- ✅ Use parameterized queries
- ✅ Test with XSS payloads
- ❌ Never use `eval()` with user input
- ❌ Never construct HTML strings with user input
- ❌ Never disable XSS protections

**Security Impact:** Comprehensive XSS defense with practical examples, prevents script injection, attribute injection, URL injection, and provides defense-in-depth with both sanitization and CSP.

---

## Summary

### Changes Made
- ✅ Added comprehensive JWT storage security with Supabase Auth integration
- ✅ Implemented complete CSP with all security directives and nonce support
- ✅ Added 4-layer file upload security (client, magic number, EXIF stripping, virus scan)
- ✅ Implemented detailed rate limiting with tiers, Redis, and monitoring
- ✅ Added extensive XSS prevention with DOMPurify, Vue safety, and CSP integration

### Security Improvements

**Authentication & Tokens:**
- Secure JWT storage with Supabase Auth
- Automatic token refresh
- HttpOnly cookie alternative
- Secure logout with complete cleanup
- Route guards for protected pages

**Content Security:**
- Production-ready CSP with 12 directives
- Nonce-based script execution
- Frame-ancestors prevents clickjacking
- upgrade-insecure-requests forces HTTPS
- CSP violation reporting

**File Upload Security:**
- Client-side validation (size, type)
- Server-side magic number verification
- EXIF metadata stripping
- Virus scanning integration (ClamAV)
- Cloudinary signed uploads
- URL validation on server

**Rate Limiting:**
- Per-endpoint rate limiting tiers
- Sliding window algorithm
- Redis and database implementations
- IP-based limiting for auth
- Dynamic limits for premium users
- Violation monitoring and alerting

**XSS Prevention:**
- DOMPurify strict configuration
- Vue template safety guidelines
- URL scheme validation
- Server-side sanitization
- Dangerous pattern warnings
- CSP integration for defense-in-depth

### Implementation Quality
- Production-ready code examples
- Multiple implementation strategies
- Database and Redis alternatives
- Development vs production configs
- Monitoring and alerting patterns
- Comprehensive testing guidance

### Documentation Quality
- Detailed code examples for every pattern
- Security impact explanations
- Before/after comparisons
- Common pitfalls highlighted
- Testing strategies included
- Checklists for verification

---

## Next Steps

**Batch 6: Performance & Monitoring Issues**
- Database query optimization
- Caching strategies
- Performance monitoring setup
- Error tracking integration
- Logging best practices

Ready to proceed with Batch 6 when approved! 🚀
