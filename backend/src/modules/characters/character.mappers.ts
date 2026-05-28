import type { Prisma } from '@prisma/client'
import { getAbilityModifier } from '../character-stats/character-stats.rules'

export const roleClassSelect = {
  id: true,
  name: true,
  description: true,
  createdById: true,
  isPublic: true,
  isActive: true,
} as const

export const characterStatsSelect = {
  strength: true,
  dexterity: true,
  constitution: true,
  intelligence: true,
  wisdom: true,
  charisma: true,
} as const

export const characterProfileSelect = {
  id: true,
  userId: true,
  roleClassId: true,
  name: true,
  description: true,
  professionalFunction: true,
  fatigueLimit: true,
  currentFatigue: true,
  roleClass: {
    select: roleClassSelect,
  },
  stats: {
    select: characterStatsSelect,
  },
  createdAt: true,
  updatedAt: true,
} as const

export type CharacterProfileEntity = Prisma.CharacterGetPayload<{
  select: typeof characterProfileSelect
}>

export type RoleClassDto = {
  id: string
  name: string
  description: string | null
}

export type CharacterStatsDto = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type CharacterModifiersDto = CharacterStatsDto

export type CharacterProfileDto = {
  id: string
  userId: string
  roleClassId: string | null
  roleClass: RoleClassDto | null
  name: string
  description: string | null
  professionalFunction: string | null
  fatigueLimit: number
  currentFatigue: number
  baseStats: CharacterStatsDto | null
  modifiers: CharacterModifiersDto | null
  createdAt: Date
  updatedAt: Date
}

export function toRoleClassDto(
  roleClass: CharacterProfileEntity['roleClass'],
): RoleClassDto | null {
  if (!roleClass) {
    return null
  }

  return {
    id: roleClass.id,
    name: roleClass.name,
    description: roleClass.description ?? null,
  }
}

function toCharacterStatsDto(
  stats: CharacterProfileEntity['stats'],
): CharacterStatsDto | null {
  if (!stats) {
    return null
  }

  return {
    strength: stats.strength,
    dexterity: stats.dexterity,
    constitution: stats.constitution,
    intelligence: stats.intelligence,
    wisdom: stats.wisdom,
    charisma: stats.charisma,
  }
}

function toCharacterModifiersDto(
  stats: CharacterStatsDto | null,
): CharacterModifiersDto | null {
  if (!stats) {
    return null
  }

  return {
    strength: getAbilityModifier(stats.strength),
    dexterity: getAbilityModifier(stats.dexterity),
    constitution: getAbilityModifier(stats.constitution),
    intelligence: getAbilityModifier(stats.intelligence),
    wisdom: getAbilityModifier(stats.wisdom),
    charisma: getAbilityModifier(stats.charisma),
  }
}

export function toCharacterProfileDto(
  character: CharacterProfileEntity,
): CharacterProfileDto {
  const baseStats = toCharacterStatsDto(character.stats)

  return {
    id: character.id,
    userId: character.userId,
    roleClassId: character.roleClassId,
    roleClass: toRoleClassDto(character.roleClass),
    name: character.name,
    description: character.description ?? null,
    professionalFunction: character.professionalFunction ?? null,
    fatigueLimit: character.fatigueLimit,
    currentFatigue: character.currentFatigue,
    baseStats,
    modifiers: toCharacterModifiersDto(baseStats),
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  }
}
