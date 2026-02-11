import { RuntimeConfig, Subtask } from '../types'
import { GrowthAgent } from './growth'

export class SupportAgent extends GrowthAgent {
  constructor(config: RuntimeConfig) {
    super(config)
  }

  // Support agent uses the same execution logic as Growth for now
  // In production, this would have support-specific tools and logic
}
