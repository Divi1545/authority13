import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HelpPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Help & Demo</h1>
        <p className="text-muted-foreground">Learn how to use Authority13</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>5-Minute Demo Script</CardTitle>
            <CardDescription>Try Authority13 with this guided demo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>Step 1</Badge>
                <h4 className="font-semibold">Configure API Key</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-14">
                Go to Settings → API Keys and add your OpenAI API key
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>Step 2</Badge>
                <h4 className="font-semibold">Create a Task</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-14">
                In Mission Control, tell Commander: "Draft outreach to 10 leads"
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>Step 3</Badge>
                <h4 className="font-semibold">Watch the Plan</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-14">
                Commander creates a task plan and delegates to Growth Agent
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>Step 4</Badge>
                <h4 className="font-semibold">Handle Approval</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-14">
                Go to Approvals page, review the emails, approve or edit
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>Step 5</Badge>
                <h4 className="font-semibold">Check Audit Log</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-14">
                View all actions and decisions in the Audit Log
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What is BYOK?</h4>
              <p className="text-sm text-muted-foreground">
                BYOK (Bring Your Own Key) means you provide your own AI provider API keys. 
                You're billed directly by the provider. Authority13 charges only the platform fee.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">How do approvals work?</h4>
              <p className="text-sm text-muted-foreground">
                Risky actions (sending emails, webhooks, payments) require approval before execution. 
                You can approve, reject, or edit the action before it runs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">What are the different agents?</h4>
              <p className="text-sm text-muted-foreground">
                • Commander: Plans and coordinates tasks<br/>
                • Growth: Marketing, outreach, content<br/>
                • Ops: Operations, scheduling, processes<br/>
                • Support: Customer service, tickets<br/>
                • Analyst: Data analysis, reports, insights
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
