'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, Flag, Zap, Shield, Bell } from 'lucide-react'

export default function AdminConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">
          Global settings and feature flags
        </p>
      </div>

      {/* Placeholder for future configuration */}
      <Card className="p-12">
        <div className="text-center">
          <Settings className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Configuration Coming Soon</h3>
          <p className="mt-2 text-muted-foreground">
            System-wide configuration options including:
          </p>
          <div className="mx-auto mt-4 max-w-md space-y-3 text-left">
            <Card className="flex items-center gap-3 p-3">
              <Flag className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Feature Flags</div>
                <div className="text-sm text-muted-foreground">
                  Enable/disable features globally
                </div>
              </div>
            </Card>

            <Card className="flex items-center gap-3 p-3">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Rate Limits</div>
                <div className="text-sm text-muted-foreground">
                  API calls per user/workspace
                </div>
              </div>
            </Card>

            <Card className="flex items-center gap-3 p-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Default Quotas</div>
                <div className="text-sm text-muted-foreground">
                  Workspace task and spend limits
                </div>
              </div>
            </Card>

            <Card className="flex items-center gap-3 p-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Notification Settings</div>
                <div className="text-sm text-muted-foreground">
                  System-wide notifications
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Sample config sections for future implementation */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Flag className="h-5 w-5" />
            Feature Flags
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance Mode</span>
              <Badge variant="secondary">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">New Signups</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Meeting Sessions</span>
              <Badge variant="default">Enabled</Badge>
            </div>
          </div>
          <Button className="mt-4 w-full" variant="outline" disabled>
            Configure
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Zap className="h-5 w-5" />
            Rate Limits
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Calls per Hour</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasks per Day</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Concurrent Runs</span>
              <span className="font-medium">-</span>
            </div>
          </div>
          <Button className="mt-4 w-full" variant="outline" disabled>
            Configure
          </Button>
        </Card>
      </div>
    </div>
  )
}
