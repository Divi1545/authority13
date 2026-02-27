import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlassCard, GradientOrb, SectionShell } from '@/components/marketing/primitives'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    subtitle: 'per month',
    cta: 'Start Free',
    features: ['1 workspace', 'Commander + 2 agents', 'BYOK required', 'Limited runs', 'Basic approvals'],
  },
  {
    name: 'Pro',
    price: '$149',
    subtitle: 'per month',
    cta: 'Start Free',
    popular: true,
    features: [
      'Up to 5 agents',
      'Mission Control full UI',
      'Approvals + audit',
      'Email + calendar tools',
      'Weekly briefings (boardroom)',
    ],
  },
  {
    name: 'Business',
    price: '$299',
    subtitle: 'per month',
    cta: 'Start Free',
    features: ['Unlimited agents', 'Multi-user workspace', 'AI Boardroom', 'Reports + analytics', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: '$600-$1,000+/month',
    cta: 'Contact Sales',
    outline: true,
    features: ['Custom connectors + SLA', 'White-label options', 'Dedicated onboarding', 'Custom integrations', '24/7 support'],
  },
]

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40">
      <GradientOrb className="-right-20 top-12 h-72 w-72" />

      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Authority13
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <SectionShell>
        <GlassCard className="fade-up p-8 text-center md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose the plan that matches your AI workforce scale, control needs, and execution volume.
          </p>
        </GlassCard>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={[
                'glass-hover fade-up-delay-1 relative flex h-full flex-col',
                plan.popular ? 'border-primary border-2' : '',
              ].join(' ')}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4 text-3xl font-semibold">{plan.price}</div>
                <CardDescription>{plan.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-5">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {plan.outline ? (
                    <Button className="w-full" variant="outline">
                      {plan.cta}
                    </Button>
                  ) : (
                    <Link href="/signup">
                      <Button className="w-full">{plan.cta}</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-2">
        <GlassCard className="fade-up p-7">
          <h3 className="font-semibold">About BYOK (Bring Your Own Key)</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            BYOK means you bring your own model keys (OpenAI, Anthropic, Google, and more). Model usage is billed
            directly by your provider while Authority13 covers orchestration, oversight, and operating workflows.
          </p>
        </GlassCard>
      </SectionShell>
    </div>
  )
}
