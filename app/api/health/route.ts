import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 60) + '...',
      dbUrlHasPgbouncer: process.env.DATABASE_URL?.includes('pgbouncer=true'),
      dbUrlPort: process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1],
      hasDirectUrl: !!process.env.DIRECT_URL,
      directUrlPort: process.env.DIRECT_URL?.match(/:(\d+)\//)?.[1],
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasMasterKey: !!process.env.MASTER_KEY,
      hasRedisUrl: !!process.env.REDIS_URL,
      nodeEnv: process.env.NODE_ENV,
    },
  }

  // Test 1: Raw database connection
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected, NOW() as server_time`
    checks.database = { 
      status: 'connected', 
      result,
      prismaVersion: require('@prisma/client').Prisma.prismaVersion,
    }
  } catch (dbError: any) {
    checks.database = {
      status: 'error',
      message: dbError?.message || String(dbError),
      code: dbError?.code,
      meta: dbError?.meta,
    }
  }

  // Test 2: Check all tables exist with counts
  const tableCounts: Record<string, number | string> = {}
  const tables = ['User', 'Workspace', 'WorkspaceMember', 'Agent', 'Task', 'AuditEvent', 'ApiKey', 'SqlQuery']
  
  for (const table of tables) {
    try {
      const count = await (prisma as any)[table.toLowerCase()].count()
      tableCounts[table] = count
    } catch (tableError: any) {
      tableCounts[table] = `ERROR: ${tableError?.message || 'Table not found'}`
    }
  }
  checks.tables = tableCounts

  // Test 3: Try to query a user (if any exist)
  try {
    const firstUser = await prisma.user.findFirst({
      select: { id: true, email: true, createdAt: true }
    })
    checks.canReadUsers = firstUser ? { success: true, foundUser: true } : { success: true, foundUser: false }
  } catch (queryError: any) {
    checks.canReadUsers = {
      success: false,
      error: queryError?.message,
      code: queryError?.code,
    }
  }

  // Overall status
  const dbConnected = checks.database?.status === 'connected'
  const tablesOk = typeof tableCounts['User'] === 'number'
  const canQuery = checks.canReadUsers?.success === true

  checks.overallStatus = {
    healthy: dbConnected && tablesOk && canQuery,
    dbConnected,
    tablesOk,
    canQuery,
  }

  return NextResponse.json(checks, { 
    status: checks.overallStatus.healthy ? 200 : 500,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}
