import { z } from 'zod'

export const abilityScoreSchema = z.number().int().min(1).max(30)

export const characterStatsSchema = z
  .object({
    strength: abilityScoreSchema,
    dexterity: abilityScoreSchema,
    constitution: abilityScoreSchema,
    intelligence: abilityScoreSchema,
    wisdom: abilityScoreSchema,
    charisma: abilityScoreSchema,
  })
  .strict()

export const updateCharacterStatsSchema = characterStatsSchema.partial().strict()

export type CharacterStatsInput = z.infer<typeof characterStatsSchema>
export type UpdateCharacterStatsInput = z.infer<
  typeof updateCharacterStatsSchema
>