import { z } from 'zod'

export const eventTypeSchema = z.enum([
  'PRODUCTION_PROBLEM',
  'WEATHER_CHANGE',
  'RESOURCE_LIMIT',
  'EQUIPMENT_FAILURE',
  'TEAM_CONFLICT',
  'INFORMATION_UPDATE',
])

export const sessionEventParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const sessionEventSessionParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

export const createSessionEventSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    eventType: eventTypeSchema,
    impact: z.string().optional().nullable(),
  })
  .strict()

export const updateSessionEventSchema = createSessionEventSchema.partial().strict()

export type SessionEventParamsInput = z.infer<typeof sessionEventParamsSchema>
export type SessionEventSessionParamsInput = z.infer<
  typeof sessionEventSessionParamsSchema
>
export type CreateSessionEventInput = z.infer<typeof createSessionEventSchema>
export type UpdateSessionEventInput = z.infer<typeof updateSessionEventSchema>