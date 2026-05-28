import {
  getAbilityModifier,
  rollAbilityScores,
  type AbilityScores,
} from '../calculation/stats.rules'
import { characterRepository } from '../characters/character.repository'
import { characterStatsRepository } from './character-stats.repository'
import { CharacterNotFoundError } from '../characters/errors'

function calculateFatigueLimit(constitution: number): number {
  return Math.max(3, 3 + getAbilityModifier(constitution))
}

export const characterStatsService = {
  async updateCharacterStats(id: string, stats: AbilityScores) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return characterStatsRepository.upsertStatsAndUpdateFatigueLimit(
      id,
      stats,
      calculateFatigueLimit(stats.constitution),
    )
  },

  async rollCharacterStats(id: string) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const result = rollAbilityScores()
    const updatedStats =
      await characterStatsRepository.upsertStatsAndUpdateFatigueLimit(
        id,
        result.stats,
        calculateFatigueLimit(result.stats.constitution),
      )

    return {
      stats: updatedStats,
      rolls: result.rolls,
    }
  },
}
