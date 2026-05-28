import type { ItemEffectDto } from '../calculation/item-effects.rules'
import type { SkillBonus } from '../calculation/skills.rules'
import type { SavingThrowBonus } from '../calculation/saving-throws.rules'
import type { AbilityName, AbilityScores } from '../calculation/stats.rules'

export type AbilityModifiers = AbilityScores

export type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'body'
  | 'ring1'
  | 'ring2'
  | 'amulet'
  | 'boots'

export type CharacterProfileDto = {
  id: string
  name: string
  race: string
  className: string
  level: number

  description: string | null
  alignment: string | null
  background: string | null
  avatarUrl: string | null

  currentHp: number
  temporaryHp: number
  speed: number
  inspiration: boolean

  createdAt: Date
  updatedAt: Date
}

export type CharacterStatsDto = {
  base: AbilityScores
  final: AbilityScores
  modifiers: AbilityModifiers
}

export type CharacterDerivedDto = {
  maxHp: number
  armorClass: number
  initiative: number
  passivePerception: number
  proficiencyBonus: number
}

export type CharacterItemDto = {
  id: string
  itemId: string
  name: string
  type: string | null
  effects: ItemEffectDto[]
  allowedSlots: EquipmentSlot[]
  isEquipped: boolean
  equippedSlot: EquipmentSlot | null
  quantity: number
  notes: string | null
}

export type CharacterInventoryDto = {
  items: CharacterItemDto[]
  equippedItems: CharacterItemDto[]
}

export type CharacterSheetDto = {
  character: CharacterProfileDto
  stats: CharacterStatsDto
  derived: CharacterDerivedDto
  skills: SkillBonus[]
  savingThrows: SavingThrowBonus[]
  inventory: CharacterInventoryDto
}
