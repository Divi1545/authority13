import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function BillingPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and invoices</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">Pro Plan</div>
                <div className="text-muted-foreground">$149/month</div>
              </div>
              <Badge>Active</Badge>
            </div>
            <div className="mt-6">
              <Button variant="outline">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Your billing history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Invoice management coming soon. You'll be able to view and download all your invoices here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Payment method management coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
