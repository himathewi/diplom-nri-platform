import { z } from 'zod'
import { characterStatsSchema } from '../character-stats/character-stats.schemas'

const optionalNullableStringSchema = z.string().nullable().optional()

export const characterParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const sessionCharacterParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

export const sessionCharacterCreationSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    roleClassId: z.string().uuid(),
    description: optionalNullableStringSchema,
    professionalFunction: optionalNullableStringSchema,
    baseStats: characterStatsSchema.optional(),
  })
  .strict()

export const createCharacterSchema = sessionCharacterCreationSchema
  .extend({
    sessionId: z.string().uuid(),
  })
  .strict()

export const updateCharacterSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    roleClassId: z.string().uuid().nullable().optional(),
    description: optionalNullableStringSchema,
    professionalFunction: optionalNullableStringSchema,
    currentFatigue: z.number().int().min(0).optional(),
  })
  .strict()

export type CharacterParamsInput = z.infer<typeof characterParamsSchema>
export type SessionCharacterParamsInput = z.infer<
  typeof sessionCharacterParamsSchema
>
export type SessionCharacterCreationInput = z.infer<
  typeof sessionCharacterCreationSchema
>
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
