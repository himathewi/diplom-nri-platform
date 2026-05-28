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
} as const

const characterInclude = {
  roleClass: {
    include: {
      skills: {
        orderBy: {
          name: 'asc' as const,
        },
      },
    },
  },
  stats: true,
} as const

const participantItemInclude = {
  item: true,
} as const

const participantInclude = {
  user: {
    select: userSelect,
  },
  character: {
    include: characterInclude,
  },
  items: {
    include: participantItemInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const

const taskRequiredItemInclude = {
  item: true,
} as const

const taskSkillAdvantageInclude = {
  roleSkill: {
    include: {
      roleClass: true,
    },
  },
} as const

const decisionShortInclude = {
  user: {
    select: userSelect,
  },
  sessionParticipant: {
    include: participantInclude,
  },
  event: true,
} as const

const sessionTaskInclude = {
  scenarioTask: {
    include: {
      requiredItems: {
        include: taskRequiredItemInclude,
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
      advantageSkills: {
        include: taskSkillAdvantageInclude,
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
    },
  },
  sourceTemplate: {
    include: {
      requiredItems: {
        include: taskRequiredItemInclude,
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
      advantageSkills: {
        include: taskSkillAdvantageInclude,
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
    },
  },
  requiredItems: {
    include: taskRequiredItemInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  advantageSkills: {
    include: taskSkillAdvantageInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  decisions: {
    include: decisionShortInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const

const decisionInclude = {
  user: {
    select: userSelect,
  },
  sessionParticipant: {
    include: participantInclude,
  },
  event: true,
  sessionTask: {
    include: {
      requiredItems: {
        include: taskRequiredItemInclude,
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
      advantageSkills: {
        include: taskSkillAdvantageInclude,
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
    },
  },
} as const

const sessionInclude = {
  scenario: {
    include: {
      direction: true,
      createdBy: {
        select: userSelect,
      },
      tasks: {
        include: {
          requiredItems: {
            include: taskRequiredItemInclude,
            orderBy: {
              createdAt: 'asc' as const,
            },
          },
          advantageSkills: {
            include: taskSkillAdvantageInclude,
            orderBy: {
              createdAt: 'asc' as const,
            },
          },
        },
        orderBy: {
          createdAt: 'asc' as const,
        },
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
    include: participantInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  allowedItems: {
    include: {
      item: true,
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  events: {
    include: {
      decisions: {
        include: decisionShortInclude,
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  tasks: {
    include: sessionTaskInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  decisions: {
    include: decisionInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  metrics: true,
  report: true,
} as const

const reportInclude = {
  session: {
    include: sessionInclude,
  },
} as const

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
