import { prisma } from '../../lib/db'
import { publishEvent } from '../../lib/redis'
import { RuntimeConfig, TaskPlan, RuntimeEvent } from './types'
import { CommanderAgent } from './agents/commander'
import { GrowthAgent } from './agents/growth'
import { OpsAgent } from './agents/ops'
import { SupportAgent } from './agents/support'
import { AnalystAgent } from './agents/analyst'

export class AgentRuntime {
  private config: RuntimeConfig
  private commander: CommanderAgent
  private agents: Map<string, any>

  constructor(config: RuntimeConfig) {
    this.config = config
    this.commander = new CommanderAgent(config)
    this.agents = new Map([
      ['growth', new GrowthAgent(config)],
      ['ops', new OpsAgent(config)],
      ['support', new SupportAgent(config)],
      ['analyst', new AnalystAgent(config)],
    ])
  }

  async execute(objective: string): Promise<void> {
    try {
      // Step 1: Commander creates plan
      await this.emitEvent({
        type: 'log',
        data: { message: 'Commander: Analyzing objective and creating plan...' },
        timestamp: Date.now(),
      })

      const plan = await this.commander.createPlan(objective)

      // Store task plan
      await prisma.taskPlan.create({
        data: {
          taskId: this.config.taskId,
          planJson: JSON.stringify(plan),
        },
      })

      await this.emitEvent({
        type: 'plan.created',
        data: { plan },
        timestamp: Date.now(),
      })

      await this.addRunStep('plan', { plan })

      // Step 2: Execute subtasks
      for (const subtask of plan.subtasks) {
        await this.emitEvent({
          type: 'subtask.started',
          data: { subtask },
          timestamp: Date.now(),
        })

        const agent = this.agents.get(subtask.agent)
        if (!agent) {
          throw new Error(`Agent ${subtask.agent} not found`)
        }

        await this.emitEvent({
          type: 'log',
          data: {
            message: `${subtask.agent} Agent: Starting "${subtask.title}"`,
          },
          timestamp: Date.now(),
        })

        // Execute subtask
        await agent.execute(subtask)

        await this.emitEvent({
          type: 'subtask.completed',
          data: { subtask },
          timestamp: Date.now(),
        })
      }

      await this.emitEvent({
        type: 'log',
        data: { message: 'All subtasks completed successfully!' },
        timestamp: Date.now(),
      })
    } catch (error) {
      await this.emitEvent({
        type: 'error',
        data: { error: (error as Error).message },
        timestamp: Date.now(),
      })
      throw error
    }
  }

  private async emitEvent(event: Omit<RuntimeEvent, 'timestamp'>) {
    const fullEvent: RuntimeEvent = {
      ...event,
      timestamp: Date.now(),
    }
    await publishEvent(`run:${this.config.runId}`, fullEvent)
  }

  private async addRunStep(type: string, content: any) {
    const existingSteps = await prisma.runStep.count({
      where: { runId: this.config.runId },
    })

    await prisma.runStep.create({
      data: {
        runId: this.config.runId,
        index: existingSteps,
        type,
        contentJson: JSON.stringify(content),
      },
    })
  }
}
