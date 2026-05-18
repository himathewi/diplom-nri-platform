import { prisma } from '../../lib/prisma'
import type {
  CreateSessionEventInput,
  UpdateSessionEventInput,
} from './session-events.schemas'

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

const eventInclude = {
  session: {
    include: sessionInclude,
  },
  decisions: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
}

export const sessionEventsRepository = {
  findSessionById(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      include: sessionInclude,
    })
  },

  findManyBySessionId(sessionId: string) {
    return prisma.sessionEvent.findMany({
      where: {
        sessionId,
      },
      include: {
        decisions: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findById(eventId: string) {
    return prisma.sessionEvent.findUnique({
      where: {
        id: eventId,
      },
      include: eventInclude,
    })
  },

  create(sessionId: string, data: CreateSessionEventInput) {
    return prisma.sessionEvent.create({
      data: {
        sessionId,
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        impact: data.impact,
      },
      include: eventInclude,
    })
  },

  update(eventId: string, data: UpdateSessionEventInput) {
    return prisma.sessionEvent.update({
      where: {
        id: eventId,
      },
      data,
      include: eventInclude,
    })
  },

  delete(eventId: string) {
    return prisma.sessionEvent.delete({
      where: {
        id: eventId,
      },
    })
  },
}