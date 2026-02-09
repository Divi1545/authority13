/**
 * SQL Query Validation and Security Utilities
 */

// Dangerous SQL keywords that should be blocked
const BLOCKED_KEYWORDS = [
  'DROP',
  'TRUNCATE',
  'DELETE',
  'ALTER',
  'CREATE',
  'GRANT',
  'REVOKE',
  'EXECUTE',
  'EXEC',
  'CALL',
  'INSERT',
  'UPDATE',
]

// Keywords that require admin role
const ADMIN_ONLY_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
]

// System tables that should not be accessible
const BLOCKED_TABLES = [
  'pg_',
  'information_schema',
  '_prisma_migrations',
]

export interface ValidationResult {
  isValid: boolean
  error?: string
  queryType: string
}

/**
 * Validate SQL query for managers (read-only access)
 */
export function validateManagerQuery(query: string): ValidationResult {
  const normalizedQuery = query.trim().toUpperCase()

  // Check if query starts with SELECT
  if (!normalizedQuery.startsWith('SELECT')) {
    return {
      isValid: false,
      error: 'Managers can only execute SELECT queries',
      queryType: 'UNKNOWN',
    }
  }

  // Check for dangerous keywords (subqueries might contain them)
  for (const keyword of BLOCKED_KEYWORDS) {
    if (normalizedQuery.includes(keyword)) {
      return {
        isValid: false,
        error: `Keyword '${keyword}' is not allowed`,
        queryType: 'SELECT',
      }
    }
  }

  // Check for system table access
  for (const table of BLOCKED_TABLES) {
    if (normalizedQuery.includes(table.toUpperCase())) {
      return {
        isValid: false,
        error: `Access to system tables is not allowed`,
        queryType: 'SELECT',
      }
    }
  }

  return {
    isValid: true,
    queryType: 'SELECT',
  }
}

/**
 * Validate SQL query for admins (more permissive but still secure)
 */
export function validateAdminQuery(query: string): ValidationResult {
  const normalizedQuery = query.trim().toUpperCase()

  if (!normalizedQuery) {
    return {
      isValid: false,
      error: 'Query cannot be empty',
      queryType: 'UNKNOWN',
    }
  }

  // Determine query type
  let queryType = 'UNKNOWN'
  if (normalizedQuery.startsWith('SELECT')) queryType = 'SELECT'
  else if (normalizedQuery.startsWith('INSERT')) queryType = 'INSERT'
  else if (normalizedQuery.startsWith('UPDATE')) queryType = 'UPDATE'
  else if (normalizedQuery.startsWith('DELETE')) queryType = 'DELETE'

  // Block dangerous operations even for admins
  const highlyDangerous = ['DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE']
  for (const keyword of highlyDangerous) {
    if (normalizedQuery.includes(keyword)) {
      return {
        isValid: false,
        error: `Keyword '${keyword}' is not allowed. Use database migrations instead.`,
        queryType,
      }
    }
  }

  // Check for system table access
  for (const table of BLOCKED_TABLES) {
    if (normalizedQuery.includes(table.toUpperCase())) {
      return {
        isValid: false,
        error: `Access to system tables is not allowed`,
        queryType,
      }
    }
  }

  return {
    isValid: true,
    queryType,
  }
}

/**
 * Sanitize query to prevent SQL injection (basic check)
 */
export function sanitizeQuery(query: string): string {
  // Remove any null bytes
  let sanitized = query.replace(/\0/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Extract table names from query (simple extraction)
 */
export function extractTableNames(query: string): string[] {
  const normalizedQuery = query.toUpperCase()
  const tables: string[] = []

  // Simple pattern matching for common SQL statements
  const patterns = [
    /FROM\s+["']?(\w+)["']?/gi,
    /JOIN\s+["']?(\w+)["']?/gi,
    /INTO\s+["']?(\w+)["']?/gi,
    /UPDATE\s+["']?(\w+)["']?/gi,
  ]

  for (const pattern of patterns) {
    const matches = query.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && !tables.includes(match[1])) {
        tables.push(match[1])
      }
    }
  }

  return tables
}

/**
 * Rate limiting: Track query executions per user
 */
const queryExecutionTracker = new Map<string, number[]>()

export function checkRateLimit(userId: string, maxQueriesPerMinute: number = 10): boolean {
  const now = Date.now()
  const userExecutions = queryExecutionTracker.get(userId) || []

  // Remove executions older than 1 minute
  const recentExecutions = userExecutions.filter((time) => now - time < 60000)

  if (recentExecutions.length >= maxQueriesPerMinute) {
    return false // Rate limit exceeded
  }

  // Add current execution
  recentExecutions.push(now)
  queryExecutionTracker.set(userId, recentExecutions)

  return true
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimitTracker() {
  const now = Date.now()
  for (const [userId, executions] of queryExecutionTracker.entries()) {
    const recentExecutions = executions.filter((time) => now - time < 60000)
    if (recentExecutions.length === 0) {
      queryExecutionTracker.delete(userId)
    } else {
      queryExecutionTracker.set(userId, recentExecutions)
    }
  }
}
