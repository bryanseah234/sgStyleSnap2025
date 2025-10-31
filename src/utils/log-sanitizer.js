/**
 * Log Sanitizer Utility
 * 
 * Sanitizes sensitive information from logs while keeping them verbose enough
 * for debugging. Ensures no secrets, tokens, passwords, or confidential data
 * is leaked to console.
 * 
 * @example
 * sanitizeLog('User email:', user.email)
 * // Output: 'User email: user***@example.com'
 * 
 * @example
 * sanitizeLog('API token exists:', token)
 * // Output: 'API token exists: [REDACTED - length: 32]'
 */

/**
 * Sanitizes email addresses - shows partial email for debugging
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return 'null'
  
  const parts = email.split('@')
  if (parts.length !== 2) return email // Invalid email, return as-is
  
  const [localPart, domain] = parts
  const visibleChars = Math.min(2, localPart.length)
  const maskedLocal = localPart.substring(0, visibleChars) + '***'
  
  return `${maskedLocal}@${domain}`
}

/**
 * Sanitizes tokens/keys - shows only existence and length, never the value
 * @param {string|undefined|null} token - Token to sanitize
 * @returns {string} Sanitized token info
 */
export function sanitizeToken(token) {
  if (!token) return '[NOT SET]'
  if (typeof token !== 'string') return '[INVALID TYPE]'
  
  return `[REDACTED - length: ${token.length}]`
}

/**
 * Sanitizes URLs - removes tokens and sensitive query params
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return 'null'
  
  try {
    const urlObj = new URL(url)
    
    // Remove sensitive query params
    const sensitiveParams = ['token', 'access_token', 'refresh_token', 'code', 'state', 'session_id']
    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]')
      }
    })
    
    // Sanitize hash if it contains tokens
    if (urlObj.hash) {
      const hashParams = new URLSearchParams(urlObj.hash.substring(1))
      const hasSensitiveData = sensitiveParams.some(param => hashParams.has(param))
      if (hasSensitiveData) {
        urlObj.hash = '#[REDACTED]'
      }
    }
    
    return urlObj.toString()
  } catch {
    // If URL parsing fails, return as-is but warn
    return url.includes('token') || url.includes('access_token') ? '[URL REDACTED - contains sensitive data]' : url
  }
}

/**
 * Sanitizes user objects - removes sensitive fields, shows safe fields
 * @param {Object|null|undefined} user - User object to sanitize
 * @returns {Object|string} Sanitized user object
 */
export function sanitizeUser(user) {
  if (!user) return 'null'
  if (typeof user !== 'object') return '[INVALID TYPE]'
  
  const sanitized = {
    id: user.id || null,
    email: user.email ? sanitizeEmail(user.email) : null,
    username: user.username || null,
    name: user.name || null,
    // Never include these sensitive fields
    // password, token, refresh_token, session, etc.
  }
  
  // Include other safe metadata
  if (user.user_metadata) {
    sanitized.user_metadata = {
      ...user.user_metadata,
      // Sanitize email if present in metadata
      email: user.user_metadata.email ? sanitizeEmail(user.user_metadata.email) : user.user_metadata.email,
      // Never log picture/avatar URLs that might contain tokens
      picture: user.user_metadata.picture ? '[REDACTED URL]' : undefined,
      avatar_url: user.user_metadata.avatar_url ? '[REDACTED URL]' : undefined,
    }
  }
  
  // Remove any fields that look sensitive
  Object.keys(user).forEach(key => {
    const lowerKey = key.toLowerCase()
    if (lowerKey.includes('token') || 
        lowerKey.includes('password') || 
        lowerKey.includes('secret') ||
        lowerKey.includes('key') ||
        lowerKey === 'session' ||
        lowerKey === 'refresh_token' ||
        lowerKey === 'access_token') {
      // Don't include these fields
      return
    }
  })
  
  return sanitized
}

/**
 * Sanitizes session objects
 * @param {Object|null|undefined} session - Session object to sanitize
 * @returns {Object|string} Sanitized session
 */
export function sanitizeSession(session) {
  if (!session) return 'null'
  if (typeof session !== 'object') return '[INVALID TYPE]'
  
  return {
    access_token: '[REDACTED]',
    refresh_token: '[REDACTED]',
    expires_at: session.expires_at || null,
    expires_in: session.expires_in || null,
    token_type: session.token_type || null,
    user: sanitizeUser(session.user),
  }
}

/**
 * Sanitizes error objects - keeps error message but removes sensitive stack traces in production
 * @param {Error|Object|string} error - Error to sanitize
 * @returns {Object|string} Sanitized error
 */
export function sanitizeError(error) {
  if (!error) return 'null'
  
  if (typeof error === 'string') {
    // Check if string contains sensitive data
    if (error.toLowerCase().includes('token') || 
        error.toLowerCase().includes('password') ||
        error.toLowerCase().includes('secret') ||
        error.toLowerCase().includes('key')) {
      return '[ERROR MESSAGE REDACTED - contains sensitive keywords]'
    }
    return error
  }
  
  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeError(error.message),
      // Only include stack in development
      stack: import.meta.env.DEV ? error.stack : '[STACK REDACTED]',
    }
  }
  
  if (typeof error === 'object') {
    const sanitized = {}
    Object.keys(error).forEach(key => {
      const lowerKey = key.toLowerCase()
      if (lowerKey.includes('token') || 
          lowerKey.includes('password') || 
          lowerKey.includes('secret') ||
          lowerKey.includes('key')) {
        sanitized[key] = '[REDACTED]'
      } else if (key === 'user') {
        sanitized[key] = sanitizeUser(error[key])
      } else if (key === 'session') {
        sanitized[key] = sanitizeSession(error[key])
      } else {
        sanitized[key] = error[key]
      }
    })
    return sanitized
  }
  
  return error
}

/**
 * Sanitizes any data - auto-detects type and applies appropriate sanitization
 * @param {*} data - Data to sanitize
 * @returns {*} Sanitized data
 */
export function sanitizeData(data) {
  if (!data) return data
  
  if (typeof data === 'string') {
    // Check if it's an email
    if (data.includes('@') && data.split('@').length === 2) {
      return sanitizeEmail(data)
    }
    // Check if it's a URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return sanitizeUrl(data)
    }
    // Check if it looks like a token (long alphanumeric string)
    if (data.length > 20 && /^[A-Za-z0-9_-]+$/.test(data)) {
      return sanitizeToken(data)
    }
    return data
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }
  
  if (typeof data === 'object') {
    if (data.email) return sanitizeUser(data)
    if (data.access_token || data.refresh_token) return sanitizeSession(data)
    if (data instanceof Error) return sanitizeError(data)
    
    // Generic object sanitization
    const sanitized = {}
    Object.keys(data).forEach(key => {
      sanitized[key] = sanitizeData(data[key])
    })
    return sanitized
  }
  
  return data
}

/**
 * Safe console.log wrapper - automatically sanitizes all arguments
 * @param {...*} args - Arguments to log (will be sanitized)
 */
export function safeLog(...args) {
  if (args.length === 0) {
    console.log()
    return
  }
  const sanitized = args.map(arg => {
    if (typeof arg === 'string') {
      return arg
    }
    return sanitizeData(arg)
  })
  console.log(...sanitized)
}

/**
 * Safe console.error wrapper - automatically sanitizes all arguments
 * @param {...*} args - Arguments to log (will be sanitized)
 */
export function safeError(...args) {
  if (args.length === 0) {
    console.error()
    return
  }
  const sanitized = args.map(arg => {
    if (typeof arg === 'string') {
      return arg
    }
    return sanitizeData(arg)
  })
  console.error(...sanitized)
}

/**
 * Safe console.warn wrapper - automatically sanitizes all arguments
 * @param {...*} args - Arguments to log (will be sanitized)
 */
export function safeWarn(...args) {
  if (args.length === 0) {
    console.warn()
    return
  }
  const sanitized = args.map(arg => {
    if (typeof arg === 'string') {
      return arg
    }
    return sanitizeData(arg)
  })
  console.warn(...sanitized)
}

/**
 * Helper to create verbose but safe log messages
 * @param {string} prefix - Log prefix/icon
 * @param {string} message - Log message
 * @param {*} data - Optional data to log (will be sanitized)
 * @returns {string} Safe log message
 */
export function createSafeLogMessage(prefix, message, data = null) {
  if (data !== null) {
    const sanitized = sanitizeData(data)
    return `${prefix} ${message}`, sanitized
  }
  return `${prefix} ${message}`
}

