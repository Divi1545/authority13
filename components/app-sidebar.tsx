'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
  Database,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Mission Control', href: '/app', icon: LayoutDashboard },
  { name: 'Tasks', href: '/app/tasks', icon: ListTodo },
  { name: 'Agents', href: '/app/agents', icon: Users },
  { name: 'Connectors', href: '/app/connectors', icon: Plug },
  { name: 'Approvals', href: '/app/approvals', icon: CheckSquare },
  { name: 'SQL Editor', href: '/app/sql', icon: Database },
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
  const [pinned, setPinned] = useState(false)

  const isPlayground = pathname === '/app'
  const collapsed = isPlayground && !pinned

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setIsSuperAdmin(data?.user?.isSuperAdmin || false)
      } catch {
        // ignore
      }
    }
    if (session?.user) checkSuperAdmin()
  }, [session])

  return (
    <div
      className={cn(
        'border-r bg-white flex flex-col transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className={cn('flex items-center', collapsed ? 'p-3 justify-center' : 'p-4 justify-between')}>
        {collapsed ? (
          <Link href="/app" className="text-lg font-bold text-foreground">A13</Link>
        ) : (
          <Link href="/app" className="text-xl font-semibold tracking-tight text-foreground">Authority13</Link>
        )}
        {isPlayground && (
          <button
            onClick={() => setPinned(!pinned)}
            className={cn(
              'text-muted-foreground hover:text-foreground transition-colors',
              collapsed && 'hidden'
            )}
            title={pinned ? 'Collapse sidebar' : 'Pin sidebar'}
          >
            {pinned ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      <Separator />

      <nav className={cn('flex-1 space-y-1', collapsed ? 'p-2' : 'p-4')}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </nav>

      <div className={cn('space-y-1', collapsed ? 'p-2' : 'p-4')}>
        {isSuperAdmin && (
          <>
            <Link
              href="/admin"
              title={collapsed ? 'Super Admin' : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-colors bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
              )}
            >
              <Shield className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Super Admin</span>}
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
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && item.name}
            </Link>
          )
        })}

        <Separator className="my-2" />

        {!collapsed && (
          <div className="px-3 py-2 text-sm text-muted-foreground truncate">
            {session?.user?.name}
          </div>
        )}

        <Button
          variant="ghost"
          title={collapsed ? 'Sign Out' : undefined}
          className={cn('w-full', collapsed ? 'justify-center p-2.5' : 'justify-start gap-3')}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className={cn(collapsed ? 'w-4 h-4' : 'w-5 h-5')} />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  )
}
