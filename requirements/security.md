# Security Requirements

## 1. Frontend Security

### 1.1 Input Validation

- Sanitize all user inputs before API calls
- Use DOMPurify for HTML sanitization
- Validate email formats client-side
- Escape dynamic content in templates
- Use v-text instead of v-html where possible

---

### 1.2 Authentication Security

- Never store JWT in localStorage
- Use httpOnly cookies or secure memory storage
- Implement token refresh mechanism
- Clear sensitive data on logout
- Add auth checks to route guards

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

```javascript
// CSP Headers Configuration
{
  "Content-Security-Policy": 
    "default-src 'self'; " +
    "img-src 'self' https://res.cloudinary.com data:; " +
    "script-src 'self' 'unsafe-inline' https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' https://*.supabase.co https://api.cloudinary.com;"
}
```

---

## 3. API Security Requirements

### 3.1 Authentication

- All endpoints require valid JWT token
- Implement request validation middleware
- Use parameterized queries (no string concatenation)
- Rate limit by user ID (5 requests/second)

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

---

## 4. Privacy Requirements

### 4.1 Data Classification

- **Public:** User name, public items (future feature)
- **Friends:** Items marked with 'friends' privacy
- **Private:** Items marked with 'private' privacy, email addresses

---

### 4.2 Access Controls

- Users can only view their own private items
- Friends can only view friends' items with 'friends' privacy
- Never expose email addresses in friend searches
- Implement proper authorization checks

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
