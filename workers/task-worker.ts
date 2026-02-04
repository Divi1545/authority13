import { Worker, Job } from 'bullmq'
import { redis } from '../lib/redis'
import { prisma } from '../lib/db'
import { TaskJob } from '../lib/queue'
import { AgentRuntime } from '../packages/core/runtime'
import { publishEvent } from '../lib/redis'
import { createAuditEvent, AuditEventTypes } from '../lib/audit'

const worker = new Worker<TaskJob>(
  'tasks',
  async (job: Job<TaskJob>) => {
    console.log(`Processing task ${job.data.taskId}`)

    const { taskId, workspaceId, userId } = job.data

    try {
      // Get task details
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      })

      if (!task) {
        throw new Error('Task not found')
      }

      // Update task status
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'planning' },
      })

      // Create run
      const run = await prisma.run.create({
        data: {
          taskId,
          status: 'started',
        },
      })

      // Update task with active run
      await prisma.task.update({
        where: { id: taskId },
        data: { activeRunId: run.id },
      })

      // Emit run started event
      await publishEvent(`run:${run.id}`, {
        type: 'run.started',
        data: { runId: run.id, taskId },
        timestamp: Date.now(),
      })

      await createAuditEvent({
        workspaceId,
        type: AuditEventTypes.RUN_STARTED,
        payload: { runId: run.id, taskId },
        actorUserId: userId,
      })

      // Initialize agent runtime
      const runtime = new AgentRuntime({
        workspaceId,
        taskId,
        runId: run.id,
      })

      // Execute task
      await runtime.execute(task.objective)

      // Update run status
      await prisma.run.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          endedAt: new Date(),
        },
      })

      // Update task status
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'completed' },
      })

      // Emit completion event
      await publishEvent(`run:${run.id}`, {
        type: 'run.completed',
        data: { runId: run.id, taskId },
        timestamp: Date.now(),
      })

      await createAuditEvent({
        workspaceId,
        type: AuditEventTypes.RUN_COMPLETED,
        payload: { runId: run.id, taskId },
      })

      console.log(`Task ${taskId} completed successfully`)
    } catch (error) {
      console.error(`Task ${taskId} failed:`, error)

      // Update task status to failed
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'failed' },
      })

      await createAuditEvent({
        workspaceId,
        type: AuditEventTypes.RUN_FAILED,
        payload: { taskId, error: (error as Error).message },
      })

      throw error
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

console.log('Task worker started')

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...')
  await worker.close()
  process.exit(0)
})
