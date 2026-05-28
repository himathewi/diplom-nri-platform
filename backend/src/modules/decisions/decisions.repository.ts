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

const characterInclude = {
  user: {
    select: userSelect,
  },
  roleClass: true,
  stats: true,
}

const participantInclude = {
  user: {
    select: userSelect,
  },
  character: {
    include: characterInclude,
  },
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
    include: participantInclude,
  },
}

const sessionTaskInclude = {
  requiredItems: {
    include: {
      item: true,
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
}

const decisionInclude = {
  session: {
    include: sessionInclude,
  },
  sessionParticipant: {
    include: participantInclude,
  },
  user: {
    select: userSelect,
  },
  event: true,
  sessionTask: {
    include: sessionTaskInclude,
  },
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

  findSessionTaskById(sessionTaskId: string) {
    return prisma.sessionTask.findUnique({
      where: {
        id: sessionTaskId,
      },
      include: sessionTaskInclude,
    })
  },

  findParticipantById(participantId: string) {
    return prisma.sessionParticipant.findUnique({
      where: {
        id: participantId,
      },
      include: participantInclude,
    })
  },

  findParticipantBySessionAndUser(sessionId: string, userId: string) {
    return prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      include: participantInclude,
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

  create(
    sessionId: string,
    userId: string,
    data: CreateDecisionInput,
    sessionParticipantId: string | null,
  ) {
    return prisma.decision.create({
      data: {
        sessionId,
        userId,
        sessionParticipantId,
        eventId: data.eventId ?? null,
        sessionTaskId: data.sessionTaskId ?? null,
        description: data.description,
        result: data.result ?? null,
      },
      include: decisionInclude,
    })
  },

  update(
    decisionId: string,
    data: UpdateDecisionInput,
    sessionParticipantId?: string | null,
  ) {
    return prisma.decision.update({
      where: {
        id: decisionId,
      },
      data: {
        sessionParticipantId,
        eventId: data.eventId,
        sessionTaskId: data.sessionTaskId,
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