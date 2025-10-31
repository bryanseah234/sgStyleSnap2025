/**
 * Input Sanitization Utilities
 * Protects against XSS and SQL injection attacks
 */

/**
 * Sanitizes a string by removing all characters except alphanumeric, spaces, and specified allowed characters
 * @param {string} input - The input string to sanitize
 * @param {string} allowedSpecialChars - Additional characters to allow (e.g., '/-' for dates)
 * @returns {string} - The sanitized string
 */
export function sanitizeInput(input, allowedSpecialChars = '') {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove any null bytes
  let sanitized = input.replace(/\0/g, '')

  // Build regex pattern: alphanumeric + spaces + allowed special chars
  // This blocks unicode emojis, special characters, and potential injection attempts
  const allowedCharsPattern = allowedSpecialChars
    ? `[^a-zA-Z0-9\\s${escapeRegex(allowedSpecialChars)}]`
    : '[^a-zA-Z0-9\\s]'
  
  const regex = new RegExp(allowedCharsPattern, 'g')
  sanitized = sanitized.replace(regex, '')

  // Remove any SQL injection keywords and patterns (case insensitive)
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE|CAST|CONVERT)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|"|`)/g, // Remove quotes that could be used for injection
    /(<|>)/g // Remove angle brackets for XSS prevention
  ]

  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  // Trim and normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  return sanitized
}

/**
 * Sanitizes alphanumeric only (no special characters, no spaces)
 * Useful for usernames, IDs, etc.
 */
export function sanitizeAlphanumeric(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input.replace(/[^a-zA-Z0-9]/g, '').trim()
}

/**
 * Sanitizes text with basic punctuation allowed
 * Allows: letters, numbers, spaces, periods, commas, hyphens, apostrophes
 * Useful for names, descriptions, etc.
 */
export function sanitizeText(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')

  // Allow only letters, numbers, spaces, underscore, dash, backslash, forward slash
  sanitized = sanitized.replace(/[^A-Za-z0-9 _\-\\/]/g, '')

  // Collapse consecutive whitespace to a single space and trim
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  // Convert to Proper Case (capitalize each alphanumeric word, preserve separators)
  sanitized = sanitized.replace(/[A-Za-z0-9]+/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )

  // Cap at 100 characters
  if (sanitized.length > 100) {
    sanitized = sanitized.slice(0, 100)
  }

  return sanitized
}

/**
 * Sanitizes date format (allows numbers and forward slash)
 * Format: MM/DD/YYYY or DD/MM/YYYY
 */
export function sanitizeDate(input) {
  const sanitized = sanitizeInput(input, '/')
  
  // Additional validation: ensure format is reasonable
  const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/
  if (sanitized && !datePattern.test(sanitized)) {
    // If it doesn't match expected date format, return empty
    return ''
  }
  
  return sanitized
}

/**
 * Sanitizes email addresses
 * Allows: alphanumeric, @, ., -, _
 */
export function sanitizeEmail(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Allow only valid email characters
  const sanitized = input.replace(/[^a-zA-Z0-9@._-]/g, '').trim().toLowerCase()
  
  // Basic email format validation
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (sanitized && !emailPattern.test(sanitized)) {
    return ''
  }
  
  return sanitized
}

/**
 * Sanitizes search queries
 * More lenient than general input, but still safe
 */
export function sanitizeSearch(input) {
  return sanitizeInput(input, '.,\'-')
}

/**
 * Sanitizes URLs
 */
export function sanitizeUrl(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove javascript: and data: protocols to prevent XSS
  if (/^(javascript|data|vbscript|file):/i.test(input)) {
    return ''
  }

  // Only allow http, https, and relative URLs
  if (!/^(https?:)?\/\//i.test(input) && !/^\/[^/]/i.test(input)) {
    return input.replace(/[^a-zA-Z0-9/:._?=&%-]/g, '')
  }

  return input.replace(/[^a-zA-Z0-9/:._?=&%-]/g, '')
}

/**
 * Escapes special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Strips all HTML tags and encodes special characters
 */
export function stripHtml(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validates and sanitizes number input
 */
export function sanitizeNumber(input, allowDecimal = false, allowNegative = false) {
  if (input === null || input === undefined || input === '') {
    return ''
  }

  const str = String(input)
  let pattern = allowNegative ? '-?' : ''
  pattern += '\\d+'
  pattern += allowDecimal ? '(\\.\\d+)?' : ''
  
  const match = str.match(new RegExp(`^${pattern}$`))
  return match ? match[0] : ''
}

/**
 * Main sanitization function that detects type and applies appropriate sanitization
 */
export function autoSanitize(input, type = 'text') {
  switch (type) {
    case 'alphanumeric':
      return sanitizeAlphanumeric(input)
    case 'email':
      return sanitizeEmail(input)
    case 'date':
      return sanitizeDate(input)
    case 'search':
      return sanitizeSearch(input)
    case 'url':
      return sanitizeUrl(input)
    case 'number':
      return sanitizeNumber(input)
    case 'html':
      return stripHtml(input)
    case 'text':
    default:
      return sanitizeText(input)
  }
}

