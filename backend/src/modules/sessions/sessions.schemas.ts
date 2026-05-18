import { z } from 'zod'

export const sessionParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const sessionParticipantParamsSchema = z
  .object({
    id: z.string().uuid(),
    participantId: z.string().uuid(),
  })
  .strict()

export const createSessionSchema = z
  .object({
    scenarioId: z.string().uuid(),
    teamId: z.string().uuid().optional().nullable(),
  })
  .strict()

export const updateSessionSchema = z
  .object({
    scenarioId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional().nullable(),
  })
  .strict()

export const addSessionParticipantSchema = z
  .object({
    characterId: z.string().uuid(),
  })
  .strict()

export type SessionParamsInput = z.infer<typeof sessionParamsSchema>
export type SessionParticipantParamsInput = z.infer<
  typeof sessionParticipantParamsSchema
>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type AddSessionParticipantInput = z.infer<
  typeof addSessionParticipantSchema
>