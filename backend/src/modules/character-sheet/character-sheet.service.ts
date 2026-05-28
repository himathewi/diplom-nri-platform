import { CharacterNotFoundError } from '../characters/errors'
import { calculateMaxHp } from '../calculation/hp.rules'

import { getAbilityModifiers } from '../calculation/stats.rules'

import {
  toAbilityScores,
  toCharacterItemDto,
  toCharacterProfileDto,
} from './character-sheet.mappers'

import {
  calculateCharacterSheetDerived,
  calculateProficiencyBonus,
} from './character-sheet.calculation'

import {
  calculatePassivePerception,
  calculateSkillBonuses,
} from '../calculation/skills.rules'
import { calculateFinalStats } from '../calculation/item-effects.rules'

import { calculateSavingThrows } from '../calculation/saving-throws.rules'

import type {
  CharacterEntity,
  CharacterItemRepository,
  CharacterRepository,
  CharacterStatsEntity,
  CharacterStatsRepository,
} from './character-sheet.contracts'

import type { CharacterSheetDto } from './character-sheet.types'


// =========================================================
// CharacterSheetService
// =========================================================

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
    const equippedItems = inventoryItems.filter((item) => item.isEquipped)

    const baseStats = toAbilityScores(baseStatsEntity)

    const finalStats = calculateFinalStats(baseStats, equippedItems)

    const modifiers = getAbilityModifiers(finalStats)

    const proficiencyBonus = calculateProficiencyBonus(character.level)

    const skills = calculateSkillBonuses({
      modifiers,
      proficiencyBonus,
      skillStates: [],
    })

    const savingThrows = calculateSavingThrows({
      modifiers,
      proficiencyBonus,
      savingThrowStates: [],
    })

    const characterForHpCalculation = {
      ...character,
      stats: baseStatsEntity,
    }

    const derived = calculateCharacterSheetDerived({
      level: character.level,
      modifiers,
      maxHp: calculateMaxHp(characterForHpCalculation),
      passivePerception: calculatePassivePerception(skills),
      equippedItems,
    })

    return {
      character: toCharacterProfileDto(character),

      stats: {
        base: baseStats,
        final: finalStats,
        modifiers,
      },

      derived,

      skills,
      savingThrows,

      inventory: {
        items: inventoryItems,
        equippedItems,
      },
    }
  }

  // =======================================================
  // Character loading
  // =======================================================

  private getCharacterForSheet(
    characterId: string,
  ): Promise<CharacterEntity | null> {
    return this.characterRepository.findByIdForSheet(characterId)
  }

  // =======================================================
  // Stats loading
  // =======================================================

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
