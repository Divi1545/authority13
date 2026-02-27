import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard, GradientOrb, SectionShell } from '@/components/marketing/primitives'

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40">
      <GradientOrb className="-left-20 top-20 h-72 w-72" />

      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Authority13
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <SectionShell>
        <GlassCard className="fade-up p-8 md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">About Authority13</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            We are building an operating system where AI employees do real execution, not just chat, with human
            oversight built into every important action.
          </p>
        </GlassCard>
      </SectionShell>

      <SectionShell className="pt-2">
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="fade-up-delay-1 glass-hover p-7">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="mt-3 text-muted-foreground">
              AI should do real work, not only answer questions. Authority13 coordinates autonomous agents that plan,
              execute, and report with full human approval controls.
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

      <SectionShell className="pt-2">
        <GlassCard className="fade-up-delay-2 p-8">
          <h2 className="text-2xl font-semibold">Why Authority13?</h2>
          <ul className="mt-4 grid gap-3 text-muted-foreground sm:grid-cols-2">
            <li>• End-to-end task execution, not chatbot-only responses</li>
            <li>• Human-in-the-loop approvals for risky actions</li>
            <li>• Complete audit trail for compliance and accountability</li>
            <li>• Live visibility into every active workflow</li>
            <li>• BYOK architecture: your keys, your data, your control</li>
            <li>• Multi-tenant workspace and role-based governance</li>
          </ul>
        </GlassCard>
      </SectionShell>

      <SectionShell className="pt-2">
        <GlassCard className="fade-up p-8 text-center">
          <h2 className="text-3xl font-semibold">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join forward-thinking teams building AI workforces with full control and measurable outcomes.
          </p>
          <div className="mt-7">
            <Link href="/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
          </div>
        </GlassCard>
      </SectionShell>
    </div>
  )
}
