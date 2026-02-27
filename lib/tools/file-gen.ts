import { registerTool, type ToolResult } from './registry'

registerTool({
  name: 'generate_file',
  description: 'Generate a structured file (CSV, JSON, Markdown, or plain text). Returns the full content for download.',
  parameters: [
    { name: 'filename', type: 'string', description: 'Name of the file (e.g. report.md, data.csv)', required: true },
    { name: 'content', type: 'string', description: 'The file content', required: true },
    { name: 'format', type: 'string', description: 'File format: csv, json, markdown, text', required: false },
  ],
  async execute(params): Promise<ToolResult> {
    const { filename, content, format } = params
    if (!filename || !content) {
      return { success: false, output: 'Missing required parameters: filename, content' }
    }

    const detectedFormat = format || inferFormat(filename)
    const preview = content.length > 1000
      ? content.slice(0, 1000) + `\n\n... [${content.length - 1000} more characters]`
      : content

    return {
      success: true,
      output: `Generated file: **${filename}** (${detectedFormat}, ${content.length} chars)\n\n\`\`\`\n${preview}\n\`\`\``,
      data: { filename, content, format: detectedFormat, size: content.length },
    }
  },
})

function inferFormat(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'csv': return 'csv'
    case 'json': return 'json'
    case 'md': return 'markdown'
    case 'html': return 'html'
    default: return 'text'
  }
}
