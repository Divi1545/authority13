import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AppSidebar } from '@/components/app-sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
