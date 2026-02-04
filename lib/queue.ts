import { Queue, Worker, Job } from 'bullmq'
import { redis } from './redis'

export interface TaskJob {
  taskId: string
  workspaceId: string
  userId: string
}

export interface ApprovalJob {
  approvalRequestId: string
  workspaceId: string
}

// Create queues
export const taskQueue = new Queue<TaskJob>('tasks', {
  connection: redis,
})

export const approvalQueue = new Queue<ApprovalJob>('approvals', {
  connection: redis,
})

// Helper to add task to queue
export async function enqueueTask(data: TaskJob) {
  const job = await taskQueue.add('execute-task', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  })
  return job.id
}

// Helper to add approval to queue
export async function enqueueApproval(data: ApprovalJob) {
  const job = await approvalQueue.add('process-approval', data, {
    attempts: 2,
  })
  return job.id
}
