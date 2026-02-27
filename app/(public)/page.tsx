import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlassCard, GradientOrb, SectionShell } from '@/components/marketing/primitives'

const features = [
  {
    title: 'Mission Control',
    description: 'Full-screen command center with live execution plans, agent cards, and real-time streaming.',
    icon: '🎯',
  },
  {
    title: 'Real Tool System',
    description: 'Agents use web search, scraping, email, webhooks, file generation, and data analysis autonomously.',
    icon: '🔧',
  },
  {
    title: 'Multi-Channel',
    description: 'Deploy agents on Telegram, Discord, Slack, WhatsApp, and email. One brain, every channel.',
    icon: '💬',
  },
  {
    title: 'Persistent Memory',
    description: 'Agents remember past decisions, context, and insights. They get smarter with every task.',
    icon: '🧠',
  },
  {
    title: 'BYOK Architecture',
    description: 'Bring your own keys for OpenAI, Deepseek, Groq, and more. Your data stays yours.',
    icon: '🔑',
  },
  {
    title: 'Approvals + Audit',
    description: 'Human-in-the-loop for risky actions. Complete audit trail for compliance.',
    icon: '🛡️',
  },
  {
    title: 'Sub-Agent System',
    description: 'Commander delegates to Growth, Ops, Support, and Analyst specialists automatically.',
    icon: '🤖',
  },
  {
    title: 'Live Streaming',
    description: 'Watch every step in real-time: planning, tool calls, agent execution, and results.',
    icon: '⚡',
  },
  {
    title: 'AGI Dashboard',
    description: 'Performance metrics, task history, success rates, and cost tracking in one view.',
    icon: '📊',
  },
]

const integrations = [
  'OpenAI', 'Deepseek', 'Groq', 'Anthropic', 'Google', 'Mistral',
  'Telegram', 'Discord', 'Slack', 'WhatsApp', 'Email', 'Webhooks',
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40">
      <GradientOrb className="-left-24 -top-20 h-72 w-72" />
      <GradientOrb className="right-0 top-56 h-80 w-80" />
      <GradientOrb className="-right-32 top-[800px] h-96 w-96" />

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

      {/* Hero */}
      <SectionShell>
        <GlassCard className="fade-up glass-hover p-8 md:p-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600">
              AGI Workforce Platform
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              AI Agents That Actually
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Do The Work</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground sm:text-lg">
              Not just chat. Real execution. Your AI workforce plans, uses tools, searches the web,
              sends emails, generates files, and reports back -- with full human oversight.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="px-8 interactive-button">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Real tool execution
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Multi-channel deploy
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                Persistent memory
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Live streaming
              </div>
            </div>
          </div>
        </GlassCard>
      </SectionShell>

      {/* How It Works */}
      <SectionShell>
        <div className="fade-up-delay-1">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            One command. Multiple agents. Real tools. Visible execution.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-4">
          {[
            { step: '1', title: 'Give the Objective', body: 'Describe your goal in plain English. The Commander analyzes and creates a plan.' },
            { step: '2', title: 'Agents Assemble', body: 'Specialist agents (Growth, Ops, Support, Analyst) are assigned to subtasks.' },
            { step: '3', title: 'Tools Execute', body: 'Agents use web search, email, webhooks, and more to complete real work.' },
            { step: '4', title: 'Results Stream Live', body: 'Watch every step, tool call, and result in real-time. Approve and track.' },
          ].map((item) => (
            <Card key={item.step} className="glass-hover fade-up-delay-1">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      {/* Features Grid */}
      <SectionShell>
        <GlassCard className="fade-up-delay-2 p-8 md:p-10">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Platform Features</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Everything you need to run an autonomous AI workforce
          </p>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="glass-hover rounded-xl border border-slate-200/80 bg-white/80 p-5">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </SectionShell>

      {/* Integrations */}
      <SectionShell className="pt-0">
        <GlassCard className="fade-up p-8 text-center">
          <h2 className="text-2xl font-semibold">Works With Everything</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {integrations.map((name) => (
              <span key={name} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                {name}
              </span>
            ))}
          </div>
        </GlassCard>
      </SectionShell>

      {/* Pricing Preview */}
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
                <li>&#10003; 1 workspace, 2 agents</li>
                <li>&#10003; All tools included</li>
                <li>&#10003; 1 channel (Telegram)</li>
                <li>&#10003; Basic approvals</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="glass-hover border-primary border-2">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>$149/month</CardDescription>
              <div className="mt-2 text-xs text-primary font-medium">Most Popular</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>&#10003; 5 agents + all tools</li>
                <li>&#10003; All channels</li>
                <li>&#10003; Persistent memory</li>
                <li>&#10003; AGI Dashboard</li>
                <li>&#10003; Priority support</li>
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
                <li>&#10003; Unlimited everything</li>
                <li>&#10003; Multi-user workspace</li>
                <li>&#10003; AI Boardroom</li>
                <li>&#10003; Custom integrations</li>
                <li>&#10003; White-label option</li>
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

      {/* CTA */}
      <SectionShell>
        <GlassCard className="fade-up p-10 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Build Your AI Workforce Today</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free with your own model keys. Deploy agents that use real tools, communicate on any channel, and remember everything.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="px-8 interactive-button">
                Get Started Free
              </Button>
            </Link>
          </div>
        </GlassCard>
      </SectionShell>

      <footer className="border-t border-white/60 bg-white/70 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Authority13 by AI Code Agency (Pvt) Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
