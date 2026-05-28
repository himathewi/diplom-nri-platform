import { z } from 'zod'
import { characterStatsSchema } from '../character-stats/character-stats.schemas'

const optionalNullableStringSchema = z.string().nullable().optional()

const avatarUrlSchema = z
  .string()
  .url()
  .or(z.literal(''))
  .nullable()
  .optional()

export const characterParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const createCharacterSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    race: z.string().min(1, 'Race is required'),
    className: z.string().min(1, 'Class is required'),

    level: z.number().int().min(1).max(20).default(1),

    description: optionalNullableStringSchema,
    alignment: optionalNullableStringSchema,
    background: optionalNullableStringSchema,
    avatarUrl: avatarUrlSchema,

    speed: z.number().int().min(0).default(30),

    baseStats: characterStatsSchema.optional(),
  })
  .strict()

export const updateCharacterSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    race: z.string().min(1, 'Race is required').optional(),
    className: z.string().min(1, 'Class is required').optional(),

    description: optionalNullableStringSchema,
    alignment: optionalNullableStringSchema,
    background: optionalNullableStringSchema,
    avatarUrl: avatarUrlSchema,

    speed: z.number().int().min(0).optional(),
  })
  .strict()

export type CharacterParamsInput = z.infer<typeof characterParamsSchema>
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
