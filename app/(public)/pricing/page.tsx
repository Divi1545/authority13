import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Authority13
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm hover:underline">
              About
            </Link>
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your AI workforce needs
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <div className="text-3xl font-bold mt-4">$49</div>
              <CardDescription>per month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li>✓ 1 workspace</li>
                <li>✓ Commander + 2 agents</li>
                <li>✓ BYOK required</li>
                <li>✓ Limited runs</li>
                <li>✓ Basic approvals</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">Start Free</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary border-2 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="text-3xl font-bold mt-4">$149</div>
              <CardDescription>per month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li>✓ Up to 5 agents</li>
                <li>✓ Mission Control full UI</li>
                <li>✓ Approvals + audit</li>
                <li>✓ Email + calendar tools</li>
                <li>✓ Weekly briefings (boardroom)</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">Start Free</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business</CardTitle>
              <div className="text-3xl font-bold mt-4">$299</div>
              <CardDescription>per month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li>✓ Unlimited agents</li>
                <li>✓ Multi-user workspace</li>
                <li>✓ AI Boardroom</li>
                <li>✓ Reports + analytics</li>
                <li>✓ Priority support</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">Start Free</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="text-3xl font-bold mt-4">Custom</div>
              <CardDescription>$600-$1,000+/month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li>✓ Custom connectors + SLA</li>
                <li>✓ White-label options</li>
                <li>✓ Dedicated onboarding</li>
                <li>✓ Custom integrations</li>
                <li>✓ 24/7 support</li>
              </ul>
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto bg-secondary/30 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">About BYOK (Bring Your Own Key)</h3>
          <p className="text-sm text-muted-foreground">
            BYOK means you bring your own model keys (OpenAI, Anthropic, or Google). 
            Your provider usage is billed by the provider directly; Authority13 adds the platform subscription fee only.
            This gives you full control over your AI costs and data.
          </p>
        </div>
      </div>
    </div>
  )
}
