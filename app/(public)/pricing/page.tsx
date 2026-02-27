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
    features: [
      '1 workspace',
      'Commander + 2 specialist agents',
      'All 8 tools included',
      '1 channel (Telegram)',
      'Basic memory (100 entries)',
      'BYOK required',
      'Basic approvals',
    ],
  },
  {
    name: 'Pro',
    price: '$149',
    subtitle: 'per month',
    cta: 'Start Free',
    popular: true,
    features: [
      'Up to 5 agents',
      'All tools + custom webhooks',
      'All channels (Telegram, Discord, Slack)',
      'Unlimited memory',
      'AGI Dashboard + analytics',
      'Mission Control full UI',
      'Approvals + full audit trail',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    price: '$299',
    subtitle: 'per month',
    cta: 'Start Free',
    features: [
      'Unlimited agents',
      'Multi-user workspace',
      'All channels + WhatsApp',
      'AI Boardroom',
      'Advanced analytics + reports',
      'Custom tool integrations',
      'Dedicated onboarding',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: '$600-$1,000+/month',
    cta: 'Contact Sales',
    outline: true,
    features: [
      'Everything in Business',
      'White-label options',
      'Custom SLA',
      'On-premise deployment',
      'Custom AI model hosting',
      'Dedicated account manager',
      '24/7 support',
    ],
  },
]

const comparison = [
  { feature: 'AI Agents', starter: '3', pro: '5', business: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Tools (search, email, etc.)', starter: 'All 8', pro: 'All + custom', business: 'All + custom', enterprise: 'All + custom' },
  { feature: 'Channels', starter: '1', pro: 'All', business: 'All + WhatsApp', enterprise: 'All + custom' },
  { feature: 'Memory', starter: '100 entries', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Dashboard', starter: 'Basic', pro: 'Full AGI', business: 'Full AGI', enterprise: 'Custom' },
  { feature: 'Audit Trail', starter: 'Basic', pro: 'Full', business: 'Full', enterprise: 'Full + export' },
  { feature: 'Support', starter: 'Community', pro: 'Priority', business: 'Priority', enterprise: '24/7 dedicated' },
]

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40">
      <GradientOrb className="-right-20 top-12 h-72 w-72" />

      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">Authority13</Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
            <Link href="/signin"><Button variant="ghost">Sign In</Button></Link>
          </div>
        </div>
      </nav>

      <SectionShell>
        <GlassCard className="fade-up p-8 text-center md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose the plan that matches your AI workforce scale. All plans include real tool execution, live streaming, and BYOK support.
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
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {plan.outline ? (
                    <Button className="w-full" variant="outline">{plan.cta}</Button>
                  ) : (
                    <Link href="/signup"><Button className="w-full">{plan.cta}</Button></Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      {/* Comparison Table */}
      <SectionShell className="pt-2">
        <GlassCard className="fade-up overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h3 className="text-xl font-semibold">Plan Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50/50">
                  <th className="text-left px-6 py-3 font-medium">Feature</th>
                  <th className="text-center px-4 py-3 font-medium">Starter</th>
                  <th className="text-center px-4 py-3 font-medium text-primary">Pro</th>
                  <th className="text-center px-4 py-3 font-medium">Business</th>
                  <th className="text-center px-4 py-3 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="px-6 py-3 font-medium">{row.feature}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground">{row.starter}</td>
                    <td className="text-center px-4 py-3">{row.pro}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground">{row.business}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </SectionShell>

      <SectionShell className="pt-2">
        <GlassCard className="fade-up p-7">
          <h3 className="font-semibold">About BYOK (Bring Your Own Key)</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            BYOK means you bring your own model keys (OpenAI, Deepseek, Groq, Anthropic, Google, and more). Model usage is billed
            directly by your provider while Authority13 covers orchestration, tools, channels, memory, and oversight workflows.
          </p>
        </GlassCard>
      </SectionShell>
    </div>
  )
}
