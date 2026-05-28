import { CharacterNotFoundError } from '../characters/errors'
import { getAbilityModifiers } from '../calculation/stats.rules'

import {
  toAbilityScores,
  toCharacterItemDto,
  toCharacterProfileDto,
  toRoleClassDto,
  toSessionDto,
  toUserDto,
} from './character-sheet.mappers'

import { calculateCharacterFatigue } from './character-sheet.calculation'

import { calculateFinalStats } from '../calculation/item-effects.rules'

import type {
  CharacterEntity,
  CharacterItemRepository,
  CharacterRepository,
  CharacterStatsEntity,
  CharacterStatsRepository,
} from './character-sheet.contracts'

import type { CharacterSheetDto } from './character-sheet.types'

export class CharacterSheetService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly characterStatsRepository: CharacterStatsRepository,
    private readonly itemRepository: CharacterItemRepository,
  ) {}

  async getCharacterSheet(characterId: string): Promise<CharacterSheetDto> {
    const character = await this.getCharacterForSheet(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const baseStatsEntity = await this.getStats(characterId)
    const items = await this.itemRepository.findByCharacterId(characterId)

    const inventoryItems = items.map((item) => toCharacterItemDto(item))
    const baseStats = toAbilityScores(baseStatsEntity)
    const finalStats = calculateFinalStats(baseStats, inventoryItems)
    const modifiers = getAbilityModifiers(finalStats)

    return {
      character: toCharacterProfileDto(character),
      user: toUserDto(character.user),
      roleClass: toRoleClassDto(character.roleClass),
      stats: {
        base: baseStats,
        final: finalStats,
        modifiers,
      },
      fatigue: calculateCharacterFatigue({
        limit: character.fatigueLimit,
        current: character.currentFatigue,
      }),
      inventory: {
        items: inventoryItems,
      },
      sessions: character.sessionParticipants.map((participant) =>
        toSessionDto(participant),
      ),
    }
  }

  private getCharacterForSheet(
    characterId: string,
  ): Promise<CharacterEntity | null> {
    return this.characterRepository.findByIdForSheet(characterId)
  }

  private async getStats(characterId: string): Promise<CharacterStatsEntity> {
    const stats = await this.characterStatsRepository.findByCharacterId(
      characterId,
    )

    if (!stats) {
      return {
        characterId,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      }
    }

    return stats
  }
}
