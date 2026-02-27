import { z } from 'zod'

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long (max 5000 chars)'),
})

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  workspaceName: z.string().min(1).max(100).optional(),
})

export const apiKeySchema = z.object({
  workspaceId: z.string().min(1),
  provider: z.string().min(1),
  apiKey: z.string().min(1, 'API key is required'),
})

export const telegramConnectSchema = z.object({
  botToken: z.string().regex(/^\d+:[A-Za-z0-9_-]{35,}$/, 'Invalid Telegram bot token format'),
})

export const spendLimitSchema = z.object({
  dailyLimitUsd: z.number().min(0).max(10000).nullable(),
  monthlyLimitUsd: z.number().min(0).max(100000).nullable(),
})

export const connectorConfigSchema = z.object({
  type: z.enum(['smtp', 'webhook', 'calendar', 'telegram']),
  config: z.record(z.string()),
})

export const teamInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'operator', 'viewer']),
})

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.errors[0]
    return { success: false, error: firstError?.message || 'Validation failed' }
  }
  return { success: true, data: result.data }
}
