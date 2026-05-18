import { prisma } from '../../lib/prisma'
import type {
  CreateDecisionInput,
  EvaluateDecisionInput,
  UpdateDecisionInput,
} from './decisions.schemas'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

const sessionInclude = {
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
      character: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
  },
}

const decisionInclude = {
  session: {
    include: sessionInclude,
  },
  character: {
    include: {
      user: {
        select: userSelect,
      },
    },
  },
  user: {
    select: userSelect,
  },
  event: true,
}

export const decisionsRepository = {
  findSessionById(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      include: sessionInclude,
    })
  },

  findEventById(eventId: string) {
    return prisma.sessionEvent.findUnique({
      where: {
        id: eventId,
      },
    })
  },

  findCharacterById(characterId: string) {
    return prisma.character.findUnique({
      where: {
        id: characterId,
      },
      include: {
        user: {
          select: userSelect,
        },
      },
    })
  },

  findParticipant(sessionId: string, characterId: string) {
    return prisma.sessionParticipant.findUnique({
      where: {
        sessionId_characterId: {
          sessionId,
          characterId,
        },
      },
    })
  },

  findManyBySessionId(sessionId: string) {
    return prisma.decision.findMany({
      where: {
        sessionId,
      },
      include: decisionInclude,
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findById(decisionId: string) {
    return prisma.decision.findUnique({
      where: {
        id: decisionId,
      },
      include: decisionInclude,
    })
  },

  create(sessionId: string, userId: string, data: CreateDecisionInput) {
    return prisma.decision.create({
      data: {
        sessionId,
        userId,
        characterId: data.characterId ?? null,
        eventId: data.eventId ?? null,
        description: data.description,
        result: data.result ?? null,
      },
      include: decisionInclude,
    })
  },

  update(decisionId: string, data: UpdateDecisionInput) {
    return prisma.decision.update({
      where: {
        id: decisionId,
      },
      data: {
        characterId: data.characterId,
        eventId: data.eventId,
        description: data.description,
        result: data.result,
      },
      include: decisionInclude,
    })
  },

  evaluate(decisionId: string, data: EvaluateDecisionInput) {
    return prisma.decision.update({
      where: {
        id: decisionId,
      },
      data: {
        result: data.result,
        moderatorComment: data.moderatorComment,
        score: data.score,
      },
      include: decisionInclude,
    })
  },

  delete(decisionId: string) {
    return prisma.decision.delete({
      where: {
        id: decisionId,
      },
    })
  },
}