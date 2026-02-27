import { registerTool, type ToolResult } from './registry'

registerTool({
  name: 'generate_file',
  description: 'Generate a structured file (CSV, JSON, Markdown, or plain text). Use when the task requires creating a deliverable document.',
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

    const truncated = content.length > 3000 ? content.slice(0, 3000) + '\n...[truncated]' : content

    return {
      success: true,
      output: `📄 Generated file: ${filename} (${format || 'text'})\n\n\`\`\`\n${truncated}\n\`\`\``,
      data: { filename, content, format: format || 'text' },
    }
  },
})
