import type { CharacterFatigueDto } from './character-sheet.types'

export function calculateCharacterFatigue(input: {
  limit: number
  current: number
}): CharacterFatigueDto {
  return {
    limit: input.limit,
    current: input.current,
    remaining: Math.max(0, input.limit - input.current),
  }
}
