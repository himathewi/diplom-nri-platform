import {
  CharacterStatsCharacterNotFoundError,
  CharacterStatsValidationError,
} from './character-stats.errors'

import { characterStatsRepository } from './character-stats.repository'

import type {
  CharacterStatsInput,
  UpdateCharacterStatsInput,
} from './character-stats.schemas'

type AbilityScores = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

const defaultStats: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

function getAbilityModifier(value: number) {
  return Math.floor((value - 10) / 2)
}

function calculateFatigueLimit(constitution: number) {
  return Math.max(3, 3 + getAbilityModifier(constitution))
}

function getModifiers(stats: AbilityScores): AbilityScores {
  return {
    strength: getAbilityModifier(stats.strength),
    dexterity: getAbilityModifier(stats.dexterity),
    constitution: getAbilityModifier(stats.constitution),
    intelligence: getAbilityModifier(stats.intelligence),
    wisdom: getAbilityModifier(stats.wisdom),
    charisma: getAbilityModifier(stats.charisma),
  }
}

function normalizeStats(stats: AbilityScores | null | undefined): AbilityScores {
  return {
    ...defaultStats,
    ...(stats ?? {}),
  }
}

function mergeStats(
  currentStats: AbilityScores | null | undefined,
  update: UpdateCharacterStatsInput,
): AbilityScores {
  return {
    ...normalizeStats(currentStats),
    ...update,
  }
}

function getFatigueState(input: {
  fatigueLimit: number
  currentFatigue: number
}) {
  if (input.currentFatigue > input.fatigueLimit + 1) {
    return 'EXHAUSTED'
  }

  if (input.currentFatigue === input.fatigueLimit + 1) {
    return 'OVERLOADED'
  }

  return 'NORMAL'
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1
}

function rollAbilityScore() {
  const rolls = Array.from({ length: 4 }, rollD6).sort((a, b) => a - b)

  return rolls.slice(1).reduce((sum, value) => sum + value, 0)
}

function rollStats(): AbilityScores {
  return {
    strength: rollAbilityScore(),
    dexterity: rollAbilityScore(),
    constitution: rollAbilityScore(),
    intelligence: rollAbilityScore(),
    wisdom: rollAbilityScore(),
    charisma: rollAbilityScore(),
  }
}

function toStatsResponse(character: {
  id: string
  fatigueLimit: number
  currentFatigue: number
  stats: AbilityScores | null
}) {
  const base = normalizeStats(character.stats)

  return {
    characterId: character.id,
    stats: {
      base,
      modifiers: getModifiers(base),
    },
    fatigue: {
      limit: character.fatigueLimit,
      current: character.currentFatigue,
      remaining: Math.max(0, character.fatigueLimit - character.currentFatigue),
      state: getFatigueState({
        fatigueLimit: character.fatigueLimit,
        currentFatigue: character.currentFatigue,
      }),
    },
    rules: {
      modifierFormula: 'floor((value - 10) / 2)',
      fatigueLimitFormula: 'max(3, 3 + constitutionModifier)',
      rollFormula: '4d6 drop lowest',
    },
  }
}

function assertStatsUpdateIsNotEmpty(data: UpdateCharacterStatsInput) {
  if (Object.keys(data).length === 0) {
    throw new CharacterStatsValidationError(
      'At least one ability score must be provided',
    )
  }
}

export const characterStatsService = {
  async getCharacterStats(characterId: string) {
    const character = await characterStatsRepository.findCharacterById(
      characterId,
    )

    if (!character) {
      throw new CharacterStatsCharacterNotFoundError(characterId)
    }

    return toStatsResponse(character)
  },

  async setCharacterStats(
    characterId: string,
    stats: CharacterStatsInput,
  ) {
    const character = await characterStatsRepository.findCharacterById(
      characterId,
    )

    if (!character) {
      throw new CharacterStatsCharacterNotFoundError(characterId)
    }

    const fatigueLimit = calculateFatigueLimit(stats.constitution)

    const updatedCharacter =
      await characterStatsRepository.upsertStatsAndUpdateFatigueLimit(
        characterId,
        stats,
        fatigueLimit,
      )

    return toStatsResponse(updatedCharacter)
  },

  async updateCharacterStats(
    characterId: string,
    data: UpdateCharacterStatsInput,
  ) {
    assertStatsUpdateIsNotEmpty(data)

    const character = await characterStatsRepository.findCharacterById(
      characterId,
    )

    if (!character) {
      throw new CharacterStatsCharacterNotFoundError(characterId)
    }

    const nextStats = mergeStats(character.stats, data)
    const fatigueLimit = calculateFatigueLimit(nextStats.constitution)

    const updatedCharacter =
      await characterStatsRepository.updateStatsAndFatigueLimit(
        characterId,
        data,
        fatigueLimit,
      )

    return toStatsResponse(updatedCharacter)
  },

  async rollCharacterStats(characterId: string) {
    const character = await characterStatsRepository.findCharacterById(
      characterId,
    )

    if (!character) {
      throw new CharacterStatsCharacterNotFoundError(characterId)
    }

    const rolledStats = rollStats()
    const fatigueLimit = calculateFatigueLimit(rolledStats.constitution)

    const updatedCharacter =
      await characterStatsRepository.upsertStatsAndUpdateFatigueLimit(
        characterId,
        rolledStats,
        fatigueLimit,
      )

    return toStatsResponse(updatedCharacter)
  },

  async resetCharacterStats(characterId: string) {
    const character = await characterStatsRepository.findCharacterById(
      characterId,
    )

    if (!character) {
      throw new CharacterStatsCharacterNotFoundError(characterId)
    }

    const fatigueLimit = calculateFatigueLimit(defaultStats.constitution)

    const updatedCharacter =
      await characterStatsRepository.upsertStatsAndUpdateFatigueLimit(
        characterId,
        defaultStats,
        fatigueLimit,
      )

    return toStatsResponse(updatedCharacter)
  },
}