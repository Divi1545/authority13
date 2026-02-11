import { RuntimeConfig, Subtask } from '../types'
import { GrowthAgent } from './growth'

export class OpsAgent extends GrowthAgent {
  constructor(config: RuntimeConfig) {
    super(config)
  }

  // Ops agent uses the same execution logic as Growth for now
  // In production, this would have ops-specific tools and logic
}
