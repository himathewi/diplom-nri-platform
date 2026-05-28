import { calculateItemDerivedBonuses } from '../calculation/item-effects.rules'

import type {
  AbilityModifiers,
  CharacterDerivedDto,
  CharacterItemDto,
} from './character-sheet.types'

type CalculateCharacterDerivedInput = {
  level: number
  modifiers: AbilityModifiers
  maxHp: number
  passivePerception: number
  equippedItems: CharacterItemDto[]
}

export function calculateCharacterSheetDerived({
  level,
  modifiers,
  maxHp,
  passivePerception,
  equippedItems,
}: CalculateCharacterDerivedInput): CharacterDerivedDto {
  const proficiencyBonus = calculateProficiencyBonus(level)

  const itemDerivedBonuses = calculateItemDerivedBonuses(equippedItems)

  const finalMaxHp = maxHp + itemDerivedBonuses.hpBonus

  const finalArmorClass =
    10 + modifiers.dexterity + itemDerivedBonuses.armorClassBonus

  const finalInitiative =
    modifiers.dexterity + itemDerivedBonuses.initiativeBonus

  return {
    maxHp: finalMaxHp,
    armorClass: finalArmorClass,
    initiative: finalInitiative,
    passivePerception,
    proficiencyBonus,
  }
}

export function calculateProficiencyBonus(level: number): number {
  const safeLevel = Math.min(Math.max(level, 1), 20)

  return Math.ceil(safeLevel / 4) + 1
}
