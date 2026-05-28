import { EventType } from '@prisma/client'
import { z } from 'zod'

export const eventTypeSchema = z.nativeEnum(EventType)

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
    title: z.string().trim().min(1, 'Event title is required'),
    description: z.string().trim().min(1, 'Event description is required'),
    eventType: eventTypeSchema,
    impact: z.string().trim().nullable().optional(),
  })
  .strict()

export const updateSessionEventSchema = z
  .object({
    title: z.string().trim().min(1, 'Event title is required').optional(),
    description: z
      .string()
      .trim()
      .min(1, 'Event description is required')
      .optional(),
    eventType: eventTypeSchema.optional(),
    impact: z.string().trim().nullable().optional(),
  })
  .strict()

export type SessionEventParamsInput = z.infer<typeof sessionEventParamsSchema>

export type SessionEventSessionParamsInput = z.infer<
  typeof sessionEventSessionParamsSchema
>

export type CreateSessionEventInput = z.infer<typeof createSessionEventSchema>

export type UpdateSessionEventInput = z.infer<typeof updateSessionEventSchema>