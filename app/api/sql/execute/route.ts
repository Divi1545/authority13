import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireWorkspaceAccess } from '@/lib/workspace'
import { prisma } from '@/lib/db'
import {
  validateAdminQuery,
  validateManagerQuery,
  sanitizeQuery,
  checkRateLimit,
  extractTableNames,
} from '@/lib/sql-validator'
import { createAuditEvent } from '@/lib/audit'

const MAX_RESULT_ROWS = 1000
const QUERY_TIMEOUT_MS = 30000

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { query, workspaceId } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    // Check workspace access and get user role
    const member = await requireWorkspaceAccess(userId, workspaceId, 'manager')

    // Rate limiting
    if (!checkRateLimit(userId, 10)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 queries per minute.' },
        { status: 429 }
      )
    }

    // Sanitize query
    const sanitizedQuery = sanitizeQuery(query)

    // Validate based on role
    let validation
    if (member.role === 'admin') {
      validation = validateAdminQuery(sanitizedQuery)
    } else {
      // Managers can only run SELECT queries
      validation = validateManagerQuery(sanitizedQuery)
    }

    if (!validation.isValid) {
      // Log failed query attempt
      await prisma.sqlQuery.create({
        data: {
          workspaceId,
          userId,
          query: sanitizedQuery,
          status: 'error',
          error: validation.error || 'Validation failed',
          resultRows: 0,
          executionMs: Date.now() - startTime,
        },
      })

      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Execute query with timeout
    let results: any[] = []
    let error: string | null = null

    try {
      // Add LIMIT to SELECT queries if not present
      let finalQuery = sanitizedQuery
      if (
        validation.queryType === 'SELECT' &&
        !sanitizedQuery.toUpperCase().includes('LIMIT')
      ) {
        finalQuery = `${sanitizedQuery.replace(/;?\s*$/, '')} LIMIT ${MAX_RESULT_ROWS}`
      }

      // Execute with timeout
      const queryPromise = prisma.$queryRawUnsafe(finalQuery)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT_MS)
      )

      results = (await Promise.race([queryPromise, timeoutPromise])) as any[]

      // Limit results
      if (Array.isArray(results) && results.length > MAX_RESULT_ROWS) {
        results = results.slice(0, MAX_RESULT_ROWS)
      }
    } catch (err: any) {
      error = err.message || 'Query execution failed'
      console.error('SQL execution error:', err)
    }

    const executionMs = Date.now() - startTime

    // Log query execution
    const sqlQueryRecord = await prisma.sqlQuery.create({
      data: {
        workspaceId,
        userId,
        query: sanitizedQuery,
        status: error ? 'error' : 'success',
        error,
        resultRows: Array.isArray(results) ? results.length : 0,
        executionMs,
      },
    })

    // Create audit event
    await createAuditEvent({
      workspaceId,
      type: 'sql.query.executed',
      actorUserId: userId,
      payload: {
        queryId: sqlQueryRecord.id,
        queryType: validation.queryType,
        resultRows: Array.isArray(results) ? results.length : 0,
        success: !error,
        tables: extractTableNames(sanitizedQuery),
      },
    })

    if (error) {
      return NextResponse.json(
        {
          error,
          queryId: sqlQueryRecord.id,
          executionMs,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      results,
      queryId: sqlQueryRecord.id,
      executionMs,
      resultCount: Array.isArray(results) ? results.length : 0,
      queryType: validation.queryType,
    })
  } catch (error: any) {
    console.error('SQL execute API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
