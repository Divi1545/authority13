import { registerTool, type ToolResult } from './registry'

registerTool({
  name: 'analyze_data',
  description: 'Analyze structured data and produce insights. Provide data as JSON or CSV text.',
  parameters: [
    { name: 'data', type: 'string', description: 'The data to analyze (JSON array or CSV text)', required: true },
    { name: 'question', type: 'string', description: 'What to analyze or find in the data', required: true },
  ],
  async execute(params): Promise<ToolResult> {
    const { data, question } = params
    if (!data || !question) {
      return { success: false, output: 'Missing required parameters: data, question' }
    }

    let parsed: any
    try {
      parsed = JSON.parse(data)
    } catch {
      const lines = data.split('\n').filter((l: string) => l.trim())
      parsed = { rows: lines.length, preview: lines.slice(0, 5).join('\n') }
    }

    const rowCount = Array.isArray(parsed) ? parsed.length : parsed?.rows || 'unknown'

    return {
      success: true,
      output: `📊 Data Analysis:\nRows: ${rowCount}\nQuestion: ${question}\n\nData loaded and ready for analysis. The agent will process this with the LLM.`,
      data: { rowCount, question, dataPreview: JSON.stringify(parsed).slice(0, 500) },
    }
  },
})
