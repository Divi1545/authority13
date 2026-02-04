import { Tool } from './registry'

export const csvImportTool: Tool = {
  name: 'csv_import',
  description: 'Import data from CSV',
  requiresApproval: false,
  execute: async (input: any, context: any) => {
    // Mock implementation - in production, parse CSV and validate
    return {
      success: true,
      rowsImported: 0,
      message: 'CSV import not yet implemented',
    }
  },
}
