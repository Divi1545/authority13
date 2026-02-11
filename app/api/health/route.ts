import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 40) + '...',
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasMasterKey: !!process.env.MASTER_KEY,
    },
  }

  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    checks.database = { status: 'connected', result }
  } catch (dbError: any) {
    checks.database = {
      status: 'error',
      message: dbError?.message || String(dbError),
      code: dbError?.code,
    }
  }

  try {
    // Check if User table exists
    const userCount = await prisma.user.count()
    checks.tables = { status: 'ok', userCount }
  } catch (tableError: any) {
    checks.tables = {
      status: 'error',
      message: tableError?.message || String(tableError),
    }
  }

  const allOk = checks.database?.status === 'connected' && checks.tables?.status === 'ok'

  return NextResponse.json(checks, { status: allOk ? 200 : 500 })
}
