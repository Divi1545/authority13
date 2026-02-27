import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard, GradientOrb, SectionShell } from '@/components/marketing/primitives'

const capabilities = [
  { title: 'Real Tool Execution', desc: 'Agents don\'t just talk -- they search the web, send emails, call APIs, generate files, and analyze data.' },
  { title: 'Multi-Channel Deployment', desc: 'Deploy your AI workforce on Telegram, Discord, Slack, WhatsApp, and email. One brain, every channel.' },
  { title: 'Persistent Memory', desc: 'Agents remember past decisions, context, and insights. They get smarter and more effective over time.' },
  { title: 'Sub-Agent Architecture', desc: 'Commander delegates to Growth, Ops, Support, and Analyst specialists. Each with domain expertise.' },
  { title: 'Human-in-the-Loop', desc: 'Approve risky actions, review plans, and maintain complete audit trails for compliance.' },
  { title: 'Live Streaming', desc: 'Watch every planning step, tool call, and agent execution in real-time with full visibility.' },
]

const timeline = [
  { phase: 'Foundation', items: ['Multi-agent orchestration', 'BYOK architecture', 'Approval workflows', 'Audit trails'] },
  { phase: 'Tools & Execution', items: ['Web search & scraping', 'Email & webhooks', 'File generation', 'Data analysis'] },
  { phase: 'Channels & Memory', items: ['Telegram integration', 'Persistent agent memory', 'AGI Dashboard', 'Performance analytics'] },
  { phase: 'Scale', items: ['Discord & Slack', 'WhatsApp Business', 'Browser automation', 'Cron scheduling'] },
]

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40">
      <GradientOrb className="-left-20 top-20 h-72 w-72" />
      <GradientOrb className="right-0 top-[600px] h-80 w-80" />

      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">Authority13</Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/signin"><Button variant="ghost">Sign In</Button></Link>
          </div>
        </div>
      </nav>

      <SectionShell>
        <GlassCard className="fade-up p-8 md:p-10">
          <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            AGI Workforce Platform
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">About Authority13</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            We are building the operating system for AI workforces. Not chatbots -- real autonomous agents
            that plan, use tools, communicate across channels, and execute with human oversight.
          </p>
        </GlassCard>
      </SectionShell>

      <SectionShell className="pt-2">
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="fade-up-delay-1 glass-hover p-7">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="mt-3 text-muted-foreground">
              AI should do real work, not only answer questions. Authority13 coordinates autonomous agents that plan,
              execute with real tools, communicate on any channel, remember context, and report -- all with full human
              approval controls and audit trails.
            </p>
            <p className="mt-3 text-muted-foreground">
              We believe the future of work is a hybrid workforce where humans set objectives and AI agents execute
              with transparency, accountability, and measurable results.
            </p>
          </GlassCard>

          <GlassCard className="fade-up-delay-1 glass-hover p-7">
            <h2 className="text-2xl font-semibold">Built By</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Divindu Edirisinghe</span>
                <br />
                Founder & Creator
              </p>
              <p>
                <span className="font-medium text-foreground">AI Code Agency (Pvt) Ltd</span>
                <br />
                Building production AI systems that replace manual execution with orchestrated digital workforces.
              </p>
            </div>
          </GlassCard>
        </div>
      </SectionShell>

      {/* Capabilities */}
      <SectionShell className="pt-2">
        <GlassCard className="fade-up-delay-2 p-8">
          <h2 className="text-2xl font-semibold">Platform Capabilities</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <div key={cap.title} className="rounded-lg border border-slate-200/80 bg-white/60 p-4">
                <h3 className="font-semibold text-sm">{cap.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{cap.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </SectionShell>

      {/* Roadmap */}
      <SectionShell className="pt-2">
        <GlassCard className="fade-up p-8">
          <h2 className="text-2xl font-semibold">Platform Roadmap</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((phase, i) => (
              <div key={phase.phase} className="rounded-lg border border-slate-200/80 bg-white/60 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-sm">{phase.phase}</h3>
                </div>
                <ul className="space-y-1.5">
                  {phase.items.map((item) => (
                    <li key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-green-600 mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GlassCard>
      </SectionShell>

      <SectionShell className="pt-2">
        <GlassCard className="fade-up p-8 text-center">
          <h2 className="text-3xl font-semibold">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join forward-thinking teams building AI workforces with real tools, multi-channel deployment, and full control.
          </p>
          <div className="mt-7">
            <Link href="/signup">
              <Button size="lg" className="interactive-button">Start Free Trial</Button>
            </Link>
          </div>
        </GlassCard>
      </SectionShell>
    </div>
  )
}
