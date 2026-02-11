'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface Approval {
  id: string
  summary: string
  detailsJson: string
  editablePayloadJson: string
  status: string
  createdAt: string
  task: {
    title: string
  }
}

export default function ApprovalsPage() {
  const { data: session } = useSession()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [editedContent, setEditedContent] = useState('')

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      // Get user's workspace
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()

      const res = await fetch(`/api/approvals?workspaceId=${wsData.workspace.id}&status=pending`)
      const data = await res.json()
      setApprovals(data.approvals || [])
    } catch (error) {
      console.error('Failed to fetch approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (approvalId: string, edited?: any) => {
    try {
      await fetch(`/api/approvals/${approvalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          editedPayload: edited,
        }),
      })

      await fetchApprovals()
      setSelectedApproval(null)
    } catch (error) {
      console.error('Failed to approve:', error)
    }
  }

  const handleReject = async (approvalId: string) => {
    try {
      await fetch(`/api/approvals/${approvalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })

      await fetchApprovals()
      setSelectedApproval(null)
    } catch (error) {
      console.error('Failed to reject:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p>Loading approvals...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-muted-foreground">Review and approve risky actions</p>
      </div>

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">All clear!</p>
            <p className="text-sm text-muted-foreground">No pending approvals at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{approval.summary}</CardTitle>
                    <CardDescription>Task: {approval.task.title}</CardDescription>
                  </div>
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Approval Required
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(approval.detailsJson), null, 2)}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => {
                      setSelectedApproval(approval)
                      setEditedContent(approval.editablePayloadJson)
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedApproval(approval)
                      setEditedContent(approval.editablePayloadJson)
                    }}
                  >
                    Edit & Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(approval.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal (simplified) */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>Review Approval</CardTitle>
              <CardDescription>
                You can edit the payload before approving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    try {
                      const edited = JSON.parse(editedContent)
                      handleApprove(selectedApproval.id, edited)
                    } catch {
                      alert('Invalid JSON')
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedApproval(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
