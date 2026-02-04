import { RuntimeConfig, Subtask } from '../types'
import { GrowthAgent } from './growth'

export class AnalystAgent extends GrowthAgent {
  constructor(config: RuntimeConfig) {
    super(config)
  }

  // Analyst agent uses the same execution logic as Growth for now
  // In production, this would have analyst-specific tools and logic
}
