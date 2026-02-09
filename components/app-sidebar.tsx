'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Plug,
  CheckSquare,
  Radio,
  FileText,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Mission Control', href: '/app', icon: LayoutDashboard },
  { name: 'Tasks', href: '/app/tasks', icon: ListTodo },
  { name: 'Agents', href: '/app/agents', icon: Users },
  { name: 'Connectors', href: '/app/connectors', icon: Plug },
  { name: 'Approvals', href: '/app/approvals', icon: CheckSquare },
  { name: 'Boardroom', href: '/app/boardroom', icon: Radio },
  { name: 'Audit Log', href: '/app/audit', icon: FileText },
]

const bottomNav = [
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
  { name: 'Help', href: '/app/help', icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // Check if user is super admin
    const checkSuperAdmin = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setIsSuperAdmin(data?.user?.isSuperAdmin || false)
      } catch (error) {
        console.error('Failed to check super admin status:', error)
      }
    }

    if (session?.user) {
      checkSuperAdmin()
    }
  }, [session])

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-4">
        <Link href="/app" className="text-2xl font-bold">
          Authority13
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 space-y-1">
        {/* Super Admin Link */}
        {isSuperAdmin && (
          <>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30'
              )}
            >
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Super Admin</span>
            </Link>
            <Separator className="my-2" />
          </>
        )}

        {bottomNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}

        <Separator className="my-2" />

        <div className="px-3 py-2 text-sm text-muted-foreground">
          {session?.user?.name}
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
