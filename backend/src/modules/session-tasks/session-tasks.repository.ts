import { SessionTaskStatus } from '@prisma/client'

import { prisma } from '../../lib/prisma'

import type {
  AddSessionTaskRequiredItemInput,
  SessionTaskRequiredItemInput,
  UpdateSessionTaskInput,
} from './session-tasks.schemas'

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

const itemInclude = {
  item: true,
} as const

const taskTemplateInclude = {
  requiredItems: {
    include: itemInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const

const scenarioTaskInclude = {
  requiredItems: {
    include: itemInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const

const sessionInclude = {
  scenario: true,
  team: {
    include: {
      members: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
    },
  },
  moderator: {
    select: safeUserSelect,
  },
  participants: {
    include: {
      user: {
        select: safeUserSelect,
      },
      character: {
        include: {
          roleClass: true,
          stats: true,
        },
      },
    },
  },
} as const

const sessionTaskInclude = {
  session: {
    include: sessionInclude,
  },
  scenarioTask: {
    include: scenarioTaskInclude,
  },
  sourceTemplate: {
    include: taskTemplateInclude,
  },
  requiredItems: {
    include: itemInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  decisions: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const

type CreateSessionTaskRepositoryInput = {
  sessionId: string
  scenarioTaskId?: string | null
  sourceTemplateId?: string | null
  title: string
  descriptionForModerator?: string | null
  descriptionForParticipants?: string | null
  taskType: 'MAIN' | 'SIDE' | 'OPTIONAL'
  difficulty: number
  fatigueCost: number
  isVisibleToParticipants: boolean
  requiredItems: SessionTaskRequiredItemInput[]
}

function getCompletedAtForStatus(status: SessionTaskStatus | undefined) {
  if (status === undefined) {
    return undefined
  }

  if (
    status === SessionTaskStatus.COMPLETED
    || status === SessionTaskStatus.FAILED
    || status === SessionTaskStatus.CANCELLED
  ) {
    return new Date()
  }

  return null
}

export const sessionTasksRepository = {
  findSessionById(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      include: sessionInclude,
    })
  },

  findManyBySessionId(sessionId: string) {
    return prisma.sessionTask.findMany({
      where: {
        sessionId,
      },
      include: sessionTaskInclude,
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findVisibleManyBySessionId(sessionId: string) {
    return prisma.sessionTask.findMany({
      where: {
        sessionId,
        isVisibleToParticipants: true,
      },
      include: sessionTaskInclude,
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findById(taskId: string) {
    return prisma.sessionTask.findUnique({
      where: {
        id: taskId,
      },
      include: sessionTaskInclude,
    })
  },

  findTaskTemplateById(templateId: string) {
    return prisma.taskTemplate.findUnique({
      where: {
        id: templateId,
      },
      include: taskTemplateInclude,
    })
  },

  findScenarioTaskById(scenarioTaskId: string) {
    return prisma.scenarioTask.findUnique({
      where: {
        id: scenarioTaskId,
      },
      include: scenarioTaskInclude,
    })
  },

  findItemById(itemId: string) {
    return prisma.item.findUnique({
      where: {
        id: itemId,
      },
    })
  },

  create(data: CreateSessionTaskRepositoryInput) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.sessionTask.create({
        data: {
          sessionId: data.sessionId,
          scenarioTaskId: data.scenarioTaskId ?? null,
          sourceTemplateId: data.sourceTemplateId ?? null,
          title: data.title,
          descriptionForModerator: data.descriptionForModerator ?? null,
          descriptionForParticipants: data.descriptionForParticipants ?? null,
          taskType: data.taskType,
          difficulty: data.difficulty,
          fatigueCost: data.fatigueCost,
          isVisibleToParticipants: data.isVisibleToParticipants,
        },
      })

      if (data.requiredItems.length > 0) {
        await tx.sessionTaskRequiredItem.createMany({
          data: data.requiredItems.map((item) => ({
            sessionTaskId: task.id,
            itemId: item.itemId,
            quantity: item.quantity,
            notes: item.notes ?? null,
          })),
          skipDuplicates: true,
        })
      }

      return tx.sessionTask.findUniqueOrThrow({
        where: {
          id: task.id,
        },
        include: sessionTaskInclude,
      })
    })
  },

  update(taskId: string, data: UpdateSessionTaskInput) {
    const completedAt = getCompletedAtForStatus(data.status)

    return prisma.sessionTask.update({
      where: {
        id: taskId,
      },
      data: {
        ...(data.title !== undefined && {
          title: data.title,
        }),
        ...(data.descriptionForModerator !== undefined && {
          descriptionForModerator: data.descriptionForModerator,
        }),
        ...(data.descriptionForParticipants !== undefined && {
          descriptionForParticipants: data.descriptionForParticipants,
        }),
        ...(data.taskType !== undefined && {
          taskType: data.taskType,
        }),
        ...(data.status !== undefined && {
          status: data.status,
        }),
        ...(data.difficulty !== undefined && {
          difficulty: data.difficulty,
        }),
        ...(data.fatigueCost !== undefined && {
          fatigueCost: data.fatigueCost,
        }),
        ...(data.isVisibleToParticipants !== undefined && {
          isVisibleToParticipants: data.isVisibleToParticipants,
        }),
        ...(data.result !== undefined && {
          result: data.result,
        }),
        ...(completedAt !== undefined && {
          completedAt,
        }),
      },
      include: sessionTaskInclude,
    })
  },

  delete(taskId: string) {
    return prisma.sessionTask.delete({
      where: {
        id: taskId,
      },
    })
  },

  findRequiredItem(taskId: string, itemId: string) {
    return prisma.sessionTaskRequiredItem.findUnique({
      where: {
        sessionTaskId_itemId: {
          sessionTaskId: taskId,
          itemId,
        },
      },
      include: itemInclude,
    })
  },

  upsertRequiredItem(taskId: string, data: AddSessionTaskRequiredItemInput) {
    return prisma.sessionTaskRequiredItem.upsert({
      where: {
        sessionTaskId_itemId: {
          sessionTaskId: taskId,
          itemId: data.itemId,
        },
      },
      update: {
        quantity: data.quantity,
        notes: data.notes ?? null,
      },
      create: {
        sessionTaskId: taskId,
        itemId: data.itemId,
        quantity: data.quantity,
        notes: data.notes ?? null,
      },
      include: itemInclude,
    })
  },

  deleteRequiredItem(taskId: string, itemId: string) {
    return prisma.sessionTaskRequiredItem.delete({
      where: {
        sessionTaskId_itemId: {
          sessionTaskId: taskId,
          itemId,
        },
      },
      include: itemInclude,
    })
  },
}