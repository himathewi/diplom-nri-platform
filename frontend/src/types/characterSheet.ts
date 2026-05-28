import type { Stats } from './characters'
import type { CharacterItemForSheet } from './items'

export type AbilityName = keyof Stats

export type CharacterProfile = {
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

  createdAt: string
  updatedAt: string
}

export type SkillBonus = {
  name: string
  ability: AbilityName
  proficient: boolean
  expertise: boolean
  bonus: number
}

export type SavingThrowBonus = {
  ability: AbilityName
  label: string
  proficient: boolean
  bonus: number
}

export type CharacterSheet = {
  character: CharacterProfile

  stats: {
    base: Stats
    final: Stats
    modifiers: Record<AbilityName, number>
  }

  derived: {
    maxHp: number
    armorClass: number
    initiative: number
    passivePerception: number
    proficiencyBonus: number
  }

  skills: SkillBonus[]
  savingThrows: SavingThrowBonus[]

  inventory: {
    items: CharacterItemForSheet[]
    equippedItems: CharacterItemForSheet[]
  }
}
