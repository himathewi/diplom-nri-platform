import { prisma } from '../../lib/prisma'
import type {
  SessionCharacterCreationInput,
  UpdateCharacterInput,
} from './character.schemas'
import {
  characterProfileSelect,
  roleClassSelect,
} from './character.mappers'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

const characterSheetInclude = {
  user: {
    select: userSelect,
  },
  roleClass: {
    select: roleClassSelect,
  },
  stats: true,
  items: {
    include: {
      itemTemplate: true,
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  sessionParticipants: {
    include: {
      session: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          scenario: {
            select: {
              id: true,
              title: true,
              description: true,
              domain: true,
              goal: true,
              difficulty: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const

type CreateCharacterForSessionRepositoryInput =
  SessionCharacterCreationInput & {
    userId: string
    sessionId: string
    fatigueLimit: number
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

  findById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      select: characterProfileSelect,
    })
  },

  findAccessById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    })
  },

  findByIdForRules(id: string) {
    return prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        fatigueLimit: true,
        currentFatigue: true,
        sessionParticipants: {
          select: {
            sessionId: true,
          },
        },
      },
    })
  },

  findByIdForSheet(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: characterSheetInclude,
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
          select: {
            id: true,
            title: true,
            description: true,
            domain: true,
            goal: true,
            difficulty: true,
          },
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
        allowedRoleClasses: {
          include: {
            roleClass: {
              select: roleClassSelect,
            },
          },
        },
        allowedItemTemplates: {
          include: {
            itemTemplate: true,
          },
        },
      },
    })
  },

  countCharactersBySessionAndUser(sessionId: string, userId: string) {
    return prisma.sessionParticipant.count({
      where: {
        sessionId,
        character: {
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
    return prisma.character.create({
      data: {
        name: data.name,
        userId: data.userId,
        roleClassId: data.roleClassId,
        description: data.description ?? null,
        professionalFunction: data.professionalFunction ?? null,
        fatigueLimit: data.fatigueLimit,
        currentFatigue: 0,
        stats: {
          create: {
            strength: data.baseStats?.strength ?? 10,
            dexterity: data.baseStats?.dexterity ?? 10,
            constitution: data.baseStats?.constitution ?? 10,
            intelligence: data.baseStats?.intelligence ?? 10,
            wisdom: data.baseStats?.wisdom ?? 10,
            charisma: data.baseStats?.charisma ?? 10,
          },
        },
        sessionParticipants: {
          create: {
            sessionId: data.sessionId,
          },
        },
      },
      select: characterProfileSelect,
    })
  },

  update(id: string, data: UpdateCharacterInput) {
    return prisma.character.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.roleClassId !== undefined && {
          roleClassId: data.roleClassId,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.professionalFunction !== undefined && {
          professionalFunction: data.professionalFunction,
        }),
        ...(data.currentFatigue !== undefined && {
          currentFatigue: data.currentFatigue,
        }),
      },
      select: characterProfileSelect,
    })
  },

  delete(id: string) {
    return prisma.character.delete({
      where: { id },
    })
  },
}
