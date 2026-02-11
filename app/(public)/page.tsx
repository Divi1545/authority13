import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">Authority13</div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm hover:underline">
              Pricing
            </Link>
            <Link href="/about" className="text-sm hover:underline">
              About
            </Link>
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">Authority13</h1>
        <p className="text-3xl text-muted-foreground mb-4">
          AI Employees. Real Work. Full Control.
        </p>
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          Run your business with digital employees that plan, execute, and report — with approvals, audit logs, and live visibility.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">Start Free Trial</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="text-lg px-8">View Pricing</Button>
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <CardTitle>Tell the Commander</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Talk to ONE Commander Agent. Describe what you want done in plain English.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <CardTitle>Watch Agents Assemble</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                See the Commander delegate to specialist agents in real-time. Track every step.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <CardTitle>Approve & Track</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Review risky actions before they execute. Track costs and audit all decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-20 bg-secondary/30 rounded-lg">
        <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded bg-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Mission Control</h3>
              <p className="text-sm text-muted-foreground">
                Live agent graph + timeline + console. See AI at work in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded bg-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">In-app Agent Calls</h3>
              <p className="text-sm text-muted-foreground">
                Voice briefings with your AI workforce. No Zoom, no Twilio.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded bg-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Approvals + Audit Trails</h3>
              <p className="text-sm text-muted-foreground">
                Human-in-the-loop for risky actions. Complete audit log for compliance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded bg-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">BYOK with Spend Limits</h3>
              <p className="text-sm text-muted-foreground">
                Bring your own AI keys. Track costs. Set daily/monthly limits.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded bg-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Tag Agents in Chat</h3>
              <p className="text-sm text-muted-foreground">
                @Commander @Growth @Ops @Support @Analyst — direct delegation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded bg-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Multi-tenant Workspaces</h3>
              <p className="text-sm text-muted-foreground">
                Role-based access. Admin, Manager, Operator, Viewer permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>$49/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 1 workspace</li>
                <li>✓ Commander + 2 agents</li>
                <li>✓ BYOK required</li>
                <li>✓ Basic approvals</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary border-2">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>$149/month</CardDescription>
              <div className="text-xs text-primary mt-2">Most Popular</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Up to 5 agents</li>
                <li>✓ Mission Control full UI</li>
                <li>✓ Approvals + audit</li>
                <li>✓ Email + calendar tools</li>
                <li>✓ Weekly briefings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business</CardTitle>
              <CardDescription>$299/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Unlimited agents</li>
                <li>✓ Multi-user workspace</li>
                <li>✓ AI Boardroom</li>
                <li>✓ Reports + analytics</li>
                <li>✓ Priority support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-8">
          <Link href="/pricing">
            <Button variant="outline">See All Plans</Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Build Your AI Workforce?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Start free. No credit card required.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-lg px-8">Get Started Now</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Authority13 by AI Code Agency (Pvt) Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
