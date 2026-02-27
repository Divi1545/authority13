import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlassCard, GradientOrb, SectionShell } from '@/components/marketing/primitives'

const features = [
  {
    title: 'Mission Control',
    description: 'Live agent graph, execution timeline, and console in one command center.',
  },
  {
    title: 'In-app Agent Calls',
    description: 'Run voice briefings with your AI workforce directly in the platform.',
  },
  {
    title: 'Approvals + Audit Trails',
    description: 'Keep humans in the loop and retain complete logs for compliance.',
  },
  {
    title: 'BYOK with Spend Limits',
    description: 'Use your own model keys and maintain complete cost control.',
  },
  {
    title: 'Tag Agents in Chat',
    description: 'Delegate directly with @Commander and specialist employees.',
  },
  {
    title: 'Multi-tenant Workspaces',
    description: 'Role-based access across teams, departments, and clients.',
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40">
      <GradientOrb className="-left-24 -top-20 h-72 w-72" />
      <GradientOrb className="right-0 top-56 h-80 w-80" />

      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-xl font-semibold tracking-tight">Authority13</div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/signin" className="hidden sm:block">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <SectionShell>
        <GlassCard className="fade-up glass-hover p-8 md:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              AI Workforce Operating System
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              AI Employees.
              <br />
              Real Work. Full Control.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground sm:text-lg">
              Run your business with digital employees that plan, execute, and report, with approvals,
              audit logs, and live visibility in one mission-control workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <div>BYOK + encrypted secrets</div>
              <div>Human-in-the-loop approvals</div>
              <div>Live execution visibility</div>
            </div>
          </div>
        </GlassCard>
      </SectionShell>

      <SectionShell>
        <div className="fade-up-delay-1">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            One command in plain English, then watch the workforce plan and execute with safety controls.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Tell the Commander',
              body: 'Describe your goal in plain English and set your preferred outcome.',
            },
            {
              step: '2',
              title: 'Watch Agents Assemble',
              body: 'Commander routes work to specialist employees and executes in sequence.',
            },
            {
              step: '3',
              title: 'Approve and Track',
              body: 'Review risky actions, approve instantly, and keep a complete audit record.',
            },
          ].map((item) => (
            <Card key={item.step} className="glass-hover fade-up-delay-1">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <GlassCard className="fade-up-delay-2 p-8 md:p-10">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Key Features</h2>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-hover rounded-xl border border-slate-200/80 bg-white/80 p-4"
              >
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </SectionShell>

      <SectionShell>
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          <Card className="glass-hover">
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
          <Card className="glass-hover border-primary border-2">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>$149/month</CardDescription>
              <div className="mt-2 text-xs text-primary">Most Popular</div>
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
          <Card className="glass-hover">
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
        <div className="mt-8 text-center">
          <Link href="/pricing">
            <Button variant="outline">See All Plans</Button>
          </Link>
        </div>
      </SectionShell>

      <SectionShell>
        <GlassCard className="fade-up p-10 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Ready to Build Your AI Workforce?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free with your own model keys and launch your first digital team in minutes.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Get Started Now
              </Button>
            </Link>
          </div>
        </GlassCard>
      </SectionShell>

      <footer className="border-t border-white/60 bg-white/70 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Authority13 by AI Code Agency (Pvt) Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
