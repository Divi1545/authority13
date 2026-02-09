'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  FileText,
  Settings,
  ArrowLeft,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Users', icon: Users, href: '/admin/users' },
  { name: 'Workspaces', icon: Briefcase, href: '/admin/workspaces' },
  { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { name: 'Audit Log', icon: FileText, href: '/admin/audit' },
  { name: 'Configuration', icon: Settings, href: '/admin/config' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="font-bold">Super Admin</h2>
            <p className="text-xs text-muted-foreground">System Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Link href="/app">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to App
          </Button>
        </Link>
      </div>
    </div>
  )
}
