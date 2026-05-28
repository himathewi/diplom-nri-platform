import { prisma } from '../../lib/prisma'
import type {
  AddSessionParticipantInput,
  CreateSessionInput,
  UpdateSessionInput,
} from './sessions.schemas'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

const sessionInclude = {
  scenario: {
    include: {
      tasks: {
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
      createdBy: {
        select: userSelect,
      },
    },
  },
  team: {
    include: {
      members: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
  },
  moderator: {
    select: userSelect,
  },
  participants: {
    include: {
      user: {
        select: userSelect,
      },
      character: {
        include: {
          user: {
            select: userSelect,
          },
          roleClass: true,
          stats: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  events: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  decisions: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  metrics: true,
  report: true,
}

export const sessionsRepository = {
  findMany() {
    return prisma.gameSession.findMany({
      include: sessionInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findManyByUserId(userId: string) {
    return prisma.gameSession.findMany({
      where: {
        OR: [
          {
            moderatorId: userId,
          },
          {
            team: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
          {
            participants: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: sessionInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findById(id: string) {
    return prisma.gameSession.findUnique({
      where: { id },
      include: sessionInclude,
    })
  },

  findScenarioById(scenarioId: string) {
    return prisma.scenario.findUnique({
      where: {
        id: scenarioId,
      },
    })
  },

  findTeamById(teamId: string) {
    return prisma.team.findUnique({
      where: {
        id: teamId,
      },
    })
  },

  findCharacterById(characterId: string) {
    return prisma.character.findUnique({
      where: {
        id: characterId,
      },
    })
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userSelect,
    })
  },

  create(data: CreateSessionInput, moderatorId: string) {
    return prisma.gameSession.create({
      data: {
        scenarioId: data.scenarioId,
        teamId: data.teamId,
        moderatorId,
      },
      include: sessionInclude,
    })
  },

  update(id: string, data: UpdateSessionInput) {
    return prisma.gameSession.update({
      where: { id },
      data,
      include: sessionInclude,
    })
  },

  delete(id: string) {
    return prisma.gameSession.delete({
      where: { id },
      include: sessionInclude,
    })
  },

  start(id: string) {
    return prisma.gameSession.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
      include: sessionInclude,
    })
  },

  finish(id: string) {
    return prisma.gameSession.update({
      where: { id },
      data: {
        status: 'FINISHED',
        finishedAt: new Date(),
      },
      include: sessionInclude,
    })
  },

  findParticipant(sessionId: string, userId: string) {
    return prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    })
  },

  findParticipantById(participantId: string) {
    return prisma.sessionParticipant.findUnique({
      where: {
        id: participantId,
      },
    })
  },

  addParticipant(sessionId: string, data: AddSessionParticipantInput) {
    return prisma.sessionParticipant.create({
      data: {
        sessionId,
        userId: data.userId,
        characterId: data.characterId ?? null,
      },
      include: {
        user: {
          select: userSelect,
        },
        character: {
          include: {
            user: {
              select: userSelect,
            },
            roleClass: true,
            stats: true,
          },
        },
      },
    })
  },

  removeParticipant(participantId: string) {
    return prisma.sessionParticipant.delete({
      where: {
        id: participantId,
      },
    })
  },
}
