import { prisma } from '../../lib/prisma'

import type {
  CharacterStatsInput,
  UpdateCharacterStatsInput,
} from './character-stats.schemas'

const characterStatsSelect = {
  id: true,
  characterId: true,
  strength: true,
  dexterity: true,
  constitution: true,
  intelligence: true,
  wisdom: true,
  charisma: true,
} as const

const characterForStatsSelect = {
  id: true,
  userId: true,
  fatigueLimit: true,
  currentFatigue: true,
  stats: {
    select: characterStatsSelect,
  },
} as const

export const characterStatsRepository = {
  findCharacterById(characterId: string) {
    return prisma.character.findUnique({
      where: {
        id: characterId,
      },
      select: characterForStatsSelect,
    })
  },

  findStatsByCharacterId(characterId: string) {
    return prisma.characterStats.findUnique({
      where: {
        characterId,
      },
      select: characterStatsSelect,
    })
  },

  upsertStatsAndUpdateFatigueLimit(
    characterId: string,
    data: CharacterStatsInput,
    fatigueLimit: number,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.characterStats.upsert({
        where: {
          characterId,
        },
        create: {
          characterId,
          strength: data.strength,
          dexterity: data.dexterity,
          constitution: data.constitution,
          intelligence: data.intelligence,
          wisdom: data.wisdom,
          charisma: data.charisma,
        },
        update: {
          strength: data.strength,
          dexterity: data.dexterity,
          constitution: data.constitution,
          intelligence: data.intelligence,
          wisdom: data.wisdom,
          charisma: data.charisma,
        },
      })

      return tx.character.update({
        where: {
          id: characterId,
        },
        data: {
          fatigueLimit,
        },
        select: characterForStatsSelect,
      })
    })
  },

  updateStatsAndFatigueLimit(
    characterId: string,
    data: UpdateCharacterStatsInput,
    fatigueLimit: number,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.characterStats.upsert({
        where: {
          characterId,
        },
        create: {
          characterId,
          strength: data.strength ?? 10,
          dexterity: data.dexterity ?? 10,
          constitution: data.constitution ?? 10,
          intelligence: data.intelligence ?? 10,
          wisdom: data.wisdom ?? 10,
          charisma: data.charisma ?? 10,
        },
        update: {
          ...(data.strength !== undefined && {
            strength: data.strength,
          }),
          ...(data.dexterity !== undefined && {
            dexterity: data.dexterity,
          }),
          ...(data.constitution !== undefined && {
            constitution: data.constitution,
          }),
          ...(data.intelligence !== undefined && {
            intelligence: data.intelligence,
          }),
          ...(data.wisdom !== undefined && {
            wisdom: data.wisdom,
          }),
          ...(data.charisma !== undefined && {
            charisma: data.charisma,
          }),
        },
      })

      return tx.character.update({
        where: {
          id: characterId,
        },
        data: {
          fatigueLimit,
        },
        select: characterForStatsSelect,
      })
    })
  },
}