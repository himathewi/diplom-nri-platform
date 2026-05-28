import { prisma } from '../../lib/prisma'
import type { CreateCharacterStatsInput } from './character-stats.schemas'

export const characterStatsRepository = {
  findStatsByCharacterId(characterId: string) {
    return prisma.characterStats.findUnique({
      where: {
        characterId,
      },
    })
  },

  upsertStatsAndUpdateFatigueLimit(
    characterId: string,
    data: CreateCharacterStatsInput,
    fatigueLimit: number,
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedStats = await tx.characterStats.upsert({
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

      const character = await tx.character.findUnique({
        where: {
          id: characterId,
        },
        select: {
          currentFatigue: true,
        },
      })

      await tx.character.update({
        where: {
          id: characterId,
        },
        data: {
          fatigueLimit,
          currentFatigue: Math.min(character?.currentFatigue ?? 0, fatigueLimit),
        },
      })

      return updatedStats
    })
  },
}
