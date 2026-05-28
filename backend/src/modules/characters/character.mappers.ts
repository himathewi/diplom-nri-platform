import type { Prisma } from '@prisma/client'

export const roleClassSelect = {
  id: true,
  name: true,
  description: true,
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
    select: {
      strength: true,
      dexterity: true,
      constitution: true,
      intelligence: true,
      wisdom: true,
      charisma: true,
    },
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
  baseStats: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  } | null
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

export function toCharacterProfileDto(
  character: CharacterProfileEntity,
): CharacterProfileDto {
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
    baseStats: character.stats
      ? {
          strength: character.stats.strength,
          dexterity: character.stats.dexterity,
          constitution: character.stats.constitution,
          intelligence: character.stats.intelligence,
          wisdom: character.stats.wisdom,
          charisma: character.stats.charisma,
        }
      : null,
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  }
}
