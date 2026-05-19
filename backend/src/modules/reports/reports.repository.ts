import { prisma } from '../../lib/prisma'
import type { UpdateReportInput } from './reports.schemas'

type CreateReportData = {
  summary: string
  successfulActions?: string | null
  problemActions?: string | null
  recommendations?: string | null
}

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
      character: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  events: {
    include: {
      decisions: {
        include: {
          character: true,
          user: {
            select: userSelect,
          },
        },
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  decisions: {
    include: {
      character: true,
      user: {
        select: userSelect,
      },
      event: true,
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  metrics: true,
  report: true,
}

const reportInclude = {
  session: {
    include: sessionInclude,
  },
}

export const reportsRepository = {
  findSessionById(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      include: sessionInclude,
    })
  },

  findBySessionId(sessionId: string) {
    return prisma.sessionReport.findUnique({
      where: {
        sessionId,
      },
      include: reportInclude,
    })
  },

  findById(id: string) {
    return prisma.sessionReport.findUnique({
      where: {
        id,
      },
      include: reportInclude,
    })
  },

  create(sessionId: string, data: CreateReportData) {
    return prisma.sessionReport.create({
      data: {
        sessionId,
        summary: data.summary,
        successfulActions: data.successfulActions ?? null,
        problemActions: data.problemActions ?? null,
        recommendations: data.recommendations ?? null,
      },
      include: reportInclude,
    })
  },

  update(id: string, data: UpdateReportInput) {
    return prisma.sessionReport.update({
      where: {
        id,
      },
      data: {
        summary: data.summary,
        successfulActions: data.successfulActions,
        problemActions: data.problemActions,
        recommendations: data.recommendations,
      },
      include: reportInclude,
    })
  },

  delete(id: string) {
    return prisma.sessionReport.delete({
      where: {
        id,
      },
    })
  },
}