import type { ItemEffectDto } from '../calculation/item-effects.rules'
import type { AbilityScores } from '../calculation/stats.rules'

export type AbilityModifiers = AbilityScores

export type RoleClassDto = {
  id: string
  name: string
  description: string | null
}

export type CharacterUserDto = {
  id: string
  email: string
  name: string
  role: string
}

export type CharacterProfileDto = {
  id: string
  userId: string
  roleClassId: string | null
  name: string
  description: string | null
  professionalFunction: string | null
  fatigueLimit: number
  currentFatigue: number
  roleClass: RoleClassDto | null
  user: CharacterUserDto
  createdAt: Date
  updatedAt: Date
}

export type CharacterStatsDto = {
  base: AbilityScores
  final: AbilityScores
  modifiers: AbilityModifiers
}

export type CharacterFatigueDto = {
  limit: number
  current: number
  remaining: number
}

export type CharacterItemDto = {
  id: string
  itemId: string
  itemTemplateId: string | null
  name: string
  type: string | null
  effects: ItemEffectDto[]
  quantity: number
  notes: string | null
}

export type CharacterInventoryDto = {
  items: CharacterItemDto[]
}

export type CharacterSessionDto = {
  id: string
  sessionId: string
  status: string
  scenario: {
    id: string
    title: string
    description: string
    domain: string
    goal: string
    difficulty: number
  }
  team: {
    id: string
    name: string
    companyName: string | null
  } | null
  createdAt: Date
}

export type CharacterSheetDto = {
  character: CharacterProfileDto
  user: CharacterUserDto
  roleClass: RoleClassDto | null
  stats: CharacterStatsDto
  fatigue: CharacterFatigueDto
  inventory: CharacterInventoryDto
  sessions: CharacterSessionDto[]
}
