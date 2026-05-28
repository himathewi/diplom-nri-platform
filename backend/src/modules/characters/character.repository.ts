import { prisma } from '../../lib/prisma'

import type {
  SessionCharacterCreationInput,
  UpdateCharacterInput,
  UpdateCharacterStatsInput,
} from './character.schemas'

import {
  characterProfileSelect,
  roleClassSelect,
} from './character.mappers'

const sessionScenarioSelect = {
  id: true,
  title: true,
  description: true,
  goal: true,
  difficulty: true,
  direction: {
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
    },
  },
} as const

type CreateCharacterForSessionRepositoryInput =
  SessionCharacterCreationInput & {
    userId: string
    sessionId: string
    fatigueLimit: number
  }

type UpdateCharacterRepositoryInput = UpdateCharacterInput & {
  fatigueLimit?: number
}

function getDefaultStats() {
  return {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  }
}

function buildStatsCreateData(
  baseStats?: SessionCharacterCreationInput['baseStats'],
) {
  return {
    ...getDefaultStats(),
    ...(baseStats ?? {}),
  }
}

function buildStatsUpdateData(baseStats: UpdateCharacterStatsInput) {
  return {
    ...(baseStats.strength !== undefined && {
      strength: baseStats.strength,
    }),
    ...(baseStats.dexterity !== undefined && {
      dexterity: baseStats.dexterity,
    }),
    ...(baseStats.constitution !== undefined && {
      constitution: baseStats.constitution,
    }),
    ...(baseStats.intelligence !== undefined && {
      intelligence: baseStats.intelligence,
    }),
    ...(baseStats.wisdom !== undefined && {
      wisdom: baseStats.wisdom,
    }),
    ...(baseStats.charisma !== undefined && {
      charisma: baseStats.charisma,
    }),
  }
}

export const characterRepository = {
  findAll() {
    return prisma.character.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: characterProfileSelect,
    })
  },

  findAllByUserId(userId: string) {
    return prisma.character.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: characterProfileSelect,
    })
  },

  findAllForModerator(moderatorId: string) {
    return prisma.character.findMany({
      where: {
        sessionParticipants: {
          some: {
            session: {
              moderatorId,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: characterProfileSelect,
    })
  },

  findById(id: string) {
    return prisma.character.findUnique({
      where: {
        id,
      },
      select: characterProfileSelect,
    })
  },

  findAccessById(id: string) {
    return prisma.character.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        sessionParticipants: {
          select: {
            session: {
              select: {
                moderatorId: true,
              },
            },
          },
        },
      },
    })
  },

  findByIdForRules(id: string) {
    return prisma.character.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        roleClassId: true,
        fatigueLimit: true,
        currentFatigue: true,
        stats: true,
        sessionParticipants: {
          select: {
            sessionId: true,
          },
        },
      },
    })
  },

  findRoleClassById(roleClassId: string) {
    return prisma.roleClass.findUnique({
      where: {
        id: roleClassId,
      },
      select: roleClassSelect,
    })
  },

  findSessionForCharacterOptions(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        status: true,
        moderatorId: true,
        teamId: true,
        scenario: {
          select: sessionScenarioSelect,
        },
        team: {
          select: {
            id: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
        participants: {
          select: {
            userId: true,
            characterId: true,
          },
        },
        allowedRoleClasses: {
          include: {
            roleClass: {
              select: roleClassSelect,
            },
          },
        },
        allowedItems: {
          include: {
            item: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  },

  findSessionParticipantBySessionAndUser(sessionId: string, userId: string) {
    return prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    })
  },

  countAllowedRoleClassForSessions(sessionIds: string[], roleClassId: string) {
    return prisma.sessionAllowedRoleClass.count({
      where: {
        sessionId: {
          in: sessionIds,
        },
        roleClassId,
      },
    })
  },

  createForSession(data: CreateCharacterForSessionRepositoryInput) {
    return prisma.$transaction(async (tx) => {
      const character = await tx.character.create({
        data: {
          name: data.name,
          userId: data.userId,
          roleClassId: data.roleClassId,
          description: data.description ?? null,
          professionalFunction: data.professionalFunction ?? null,
          fatigueLimit: data.fatigueLimit,
          currentFatigue: 0,
          stats: {
            create: buildStatsCreateData(data.baseStats),
          },
        },
        select: characterProfileSelect,
      })

      const existingParticipant = await tx.sessionParticipant.findUnique({
        where: {
          sessionId_userId: {
            sessionId: data.sessionId,
            userId: data.userId,
          },
        },
      })

      if (existingParticipant) {
        await tx.sessionParticipant.update({
          where: {
            id: existingParticipant.id,
          },
          data: {
            characterId: character.id,
          },
        })
      } else {
        await tx.sessionParticipant.create({
          data: {
            sessionId: data.sessionId,
            userId: data.userId,
            characterId: character.id,
          },
        })
      }

      return character
    })
  },

  update(id: string, data: UpdateCharacterRepositoryInput) {
    return prisma.character.update({
      where: {
        id,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.roleClassId !== undefined && {
          roleClassId: data.roleClassId,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.professionalFunction !== undefined && {
          professionalFunction: data.professionalFunction,
        }),
        ...(data.fatigueLimit !== undefined && {
          fatigueLimit: data.fatigueLimit,
        }),
        ...(data.currentFatigue !== undefined && {
          currentFatigue: data.currentFatigue,
        }),
        ...(data.baseStats !== undefined && {
          stats: {
            upsert: {
              create: {
                ...getDefaultStats(),
                ...data.baseStats,
              },
              update: buildStatsUpdateData(data.baseStats),
            },
          },
        }),
      },
      select: characterProfileSelect,
    })
  },

  delete(id: string) {
    return prisma.character.delete({
      where: {
        id,
      },
    })
  },
}