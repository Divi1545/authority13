import { ToolCall } from '../types'

export type PolicyDecision = 'safe' | 'needs_approval' | 'blocked'

export interface PolicyResult {
  decision: PolicyDecision
  reason?: string
}

// Tools that always require approval
const APPROVAL_REQUIRED_TOOLS = [
  'send_email',
  'webhook_post',
  'generate_payment_link',
  'create_calendar_event',
  'upsert_db', // Only for critical tables
]

// Tools that are blocked
const BLOCKED_TOOLS: string[] = []

// Bulk action threshold
const BULK_ACTION_THRESHOLD = 10

export class ApprovalEngine {
  checkToolCall(toolCall: ToolCall, context?: any): PolicyResult {
    const { tool, input } = toolCall

    // Check if tool is blocked
    if (BLOCKED_TOOLS.includes(tool)) {
      return {
        decision: 'blocked',
        reason: `Tool "${tool}" is not allowed`,
      }
    }

    // Check if tool requires approval
    if (APPROVAL_REQUIRED_TOOLS.includes(tool)) {
      return {
        decision: 'needs_approval',
        reason: `Tool "${tool}" requires approval`,
      }
    }

    // Check for bulk actions
    if (input.bulk || input.count > BULK_ACTION_THRESHOLD) {
      return {
        decision: 'needs_approval',
        reason: `Bulk action detected (${input.count || 'multiple'} items)`,
      }
    }

    // Check for sensitive data operations
    if (tool === 'upsert_db' && this.isCriticalTable(input.table)) {
      return {
        decision: 'needs_approval',
        reason: `Modifying critical table: ${input.table}`,
      }
    }

    // Default: safe
    return {
      decision: 'safe',
    }
  }

  private isCriticalTable(tableName: string): boolean {
    const criticalTables = ['users', 'payments', 'api_keys', 'workspaces']
    return criticalTables.includes(tableName.toLowerCase())
  }
}

export const approvalEngine = new ApprovalEngine()
