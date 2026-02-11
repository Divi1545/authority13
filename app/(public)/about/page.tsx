import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Authority13
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm hover:underline">
              Pricing
            </Link>
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-5xl font-bold mb-8">About Authority13</h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              Authority13 is built on a simple belief: AI should do real work, not just answer questions.
              We're building the operating system for digital employees—autonomous agents that plan, execute,
              and report with full human oversight.
            </p>
          </section>

          <section className="bg-secondary/30 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Built By</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Divindu Edirisinghe</h3>
                <p className="text-muted-foreground">Founder & Creator</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">AI Code Agency (Pvt) Ltd</h3>
                <p className="text-muted-foreground">
                  We build production AI systems that replace manual work with intelligent automation.
                  Authority13 is our flagship product for businesses ready to deploy an AI workforce.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">Why Authority13?</h2>
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Most AI tools are chatbots in disguise. They answer questions, but they don't <em>do</em> things.
                Authority13 is different:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Agents that execute tasks end-to-end, not just respond to prompts</li>
                <li>Human-in-the-loop approvals for risky actions</li>
                <li>Complete audit trails for compliance and accountability</li>
                <li>Real-time visibility into what your AI workforce is doing</li>
                <li>BYOK architecture: your keys, your data, your control</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">The Technology</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Authority13 is built on production-grade infrastructure:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Next.js 14 with TypeScript for the frontend and API</li>
              <li>PostgreSQL for data persistence with full multi-tenant isolation</li>
              <li>Redis + BullMQ for reliable job processing</li>
              <li>Server-Sent Events for real-time updates</li>
              <li>OpenAI, Anthropic, and Google AI for agent intelligence</li>
            </ul>
          </section>

          <section className="text-center pt-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join forward-thinking businesses building their AI workforce with Authority13.
            </p>
            <Link href="/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
