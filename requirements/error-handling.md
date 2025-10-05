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
// When user exceeds 200 item limit
{
  error: "You've reached your 200 item limit. Please remove some items to add new ones.",
  code: "QUOTA_EXCEEDED",
  details: { current: 200, limit: 200 }
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

- Console logging for development
- User-friendly error messages
- Error tracking service integration
- User feedback collection

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
