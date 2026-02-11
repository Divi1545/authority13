import { Tool } from './registry'
// For MVP, we'll just store events in the database

export const createCalendarEventTool: Tool = {
  name: 'create_calendar_event',
  description: 'Create a calendar event',
  requiresApproval: true,
  execute: async (input: any, context: any) => {
    // Mock implementation - in production, integrate with Google Calendar
    return {
      success: true,
      eventId: `event_${Date.now()}`,
      title: input.title,
      start: input.start,
      end: input.end,
    }
  },
}
