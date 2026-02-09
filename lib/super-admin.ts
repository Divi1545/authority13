import { prisma } from './db'

/**
 * Check if a user is a super admin and throw if not
 */
export async function requireSuperAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, isSuperAdmin: true },
  })

  if (!user || !user.isSuperAdmin) {
    throw new Error('Super admin access required')
  }

  return user
}

/**
 * Check if a user is a super admin (returns boolean)
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  })

  return user?.isSuperAdmin ?? false
}
