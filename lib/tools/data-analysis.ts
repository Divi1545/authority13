import { registerTool, type ToolResult } from './registry'

function analyzeArray(data: any[]): string {
  if (data.length === 0) return 'Empty dataset.'

  const lines: string[] = [`**Dataset**: ${data.length} rows`]

  const sample = data[0]
  if (typeof sample !== 'object' || sample === null) {
    lines.push(`Type: Array of ${typeof sample}`)
    if (typeof sample === 'number') {
      const nums = data.filter((v) => typeof v === 'number') as number[]
      lines.push(numericStats('values', nums))
    }
    return lines.join('\n')
  }

  const keys = Object.keys(sample)
  lines.push(`**Columns** (${keys.length}): ${keys.join(', ')}`)
  lines.push('')

  for (const key of keys) {
    const values = data.map((row) => row[key]).filter((v) => v !== null && v !== undefined)
    const nums = values.filter((v) => typeof v === 'number' || !isNaN(Number(v))).map(Number)

    if (nums.length > values.length * 0.5) {
      lines.push(numericStats(key, nums))
    } else {
      const counts: Record<string, number> = {}
      values.forEach((v) => { const s = String(v); counts[s] = (counts[s] || 0) + 1 })
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
      lines.push(`**${key}** (categorical, ${values.length} values, ${Object.keys(counts).length} unique)`)
      sorted.forEach(([val, count]) => lines.push(`  - "${val}": ${count} (${((count / values.length) * 100).toFixed(1)}%)`))
    }
    lines.push('')
  }

  return lines.join('\n')
}

function numericStats(name: string, nums: number[]): string {
  if (nums.length === 0) return `**${name}**: no numeric values`
  const sorted = [...nums].sort((a, b) => a - b)
  const sum = nums.reduce((a, b) => a + b, 0)
  const avg = sum / nums.length
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]

  return [
    `**${name}** (numeric, ${nums.length} values)`,
    `  Min: ${sorted[0]} | Max: ${sorted[sorted.length - 1]} | Sum: ${sum.toFixed(2)}`,
    `  Mean: ${avg.toFixed(2)} | Median: ${median.toFixed(2)}`,
  ].join('\n')
}

registerTool({
  name: 'analyze_data',
  description: 'Analyze structured data and produce statistical insights. Provide data as JSON array or CSV text.',
  parameters: [
    { name: 'data', type: 'string', description: 'The data to analyze (JSON array or CSV text)', required: true },
    { name: 'question', type: 'string', description: 'What to analyze or find in the data', required: true },
  ],
  async execute(params): Promise<ToolResult> {
    const { data, question } = params
    if (!data || !question) {
      return { success: false, output: 'Missing required parameters: data, question' }
    }

    let parsed: any[]
    try {
      parsed = JSON.parse(data)
      if (!Array.isArray(parsed)) parsed = [parsed]
    } catch {
      const lines = data.split('\n').filter((l: string) => l.trim())
      if (lines.length < 2) {
        return { success: true, output: `Could not parse data. Provide JSON array or CSV with headers.\n\nQuestion: ${question}` }
      }
      const headers = lines[0].split(',').map((h: string) => h.trim())
      parsed = lines.slice(1).map((line: string) => {
        const vals = line.split(',').map((v: string) => v.trim())
        const obj: Record<string, any> = {}
        headers.forEach((h: string, i: number) => {
          const v = vals[i] || ''
          obj[h] = isNaN(Number(v)) || v === '' ? v : Number(v)
        })
        return obj
      })
    }

    const analysis = analyzeArray(parsed)

    return {
      success: true,
      output: `**Data Analysis**\nQuestion: ${question}\n\n${analysis}`,
      data: { rowCount: parsed.length, question },
    }
  },
})
