import { SessionTaskStatus } from '@prisma/client'

import { prisma } from '../../lib/prisma'

import type {
  AddSessionTaskRequiredItemInput,
  AddSessionTaskSkillAdvantageInput,
  SessionTaskSkillAdvantageInput,
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

const roleSkillInclude = {
  roleSkill: {
    include: {
      roleClass: true,
    },
  },
} as const

const taskTemplateInclude = {
  requiredItems: {
    include: itemInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  advantageSkills: {
    include: roleSkillInclude,
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
  advantageSkills: {
    include: roleSkillInclude,
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
  advantageSkills: {
    include: roleSkillInclude,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  decisions: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  rolls: {
    include: {
      sessionParticipant: {
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
    },
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
  diceDifficulty?: number | null
  isVisibleToParticipants: boolean
  requiredItems: SessionTaskRequiredItemInput[]
  advantageSkills: SessionTaskSkillAdvantageInput[]
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

  findRoleSkillById(roleSkillId: string) {
    return prisma.roleClassSkill.findUnique({
      where: {
        id: roleSkillId,
      },
      include: {
        roleClass: true,
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
          diceDifficulty: data.diceDifficulty ?? null,
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

      if (data.advantageSkills.length > 0) {
        await tx.sessionTaskSkillAdvantage.createMany({
          data: data.advantageSkills.map((advantage) => ({
            sessionTaskId: task.id,
            roleSkillId: advantage.roleSkillId,
            benefitType: advantage.benefitType,
            fatigueCostReduction: advantage.fatigueCostReduction,
            notes: advantage.notes ?? null,
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
        ...(data.diceDifficulty !== undefined && {
          diceDifficulty: data.diceDifficulty,
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

  findSkillAdvantage(taskId: string, roleSkillId: string) {
    return prisma.sessionTaskSkillAdvantage.findUnique({
      where: {
        sessionTaskId_roleSkillId: {
          sessionTaskId: taskId,
          roleSkillId,
        },
      },
      include: roleSkillInclude,
    })
  },

  upsertSkillAdvantage(
    taskId: string,
    data: AddSessionTaskSkillAdvantageInput,
  ) {
    return prisma.sessionTaskSkillAdvantage.upsert({
      where: {
        sessionTaskId_roleSkillId: {
          sessionTaskId: taskId,
          roleSkillId: data.roleSkillId,
        },
      },
      update: {
        benefitType: data.benefitType,
        fatigueCostReduction: data.fatigueCostReduction,
        notes: data.notes ?? null,
      },
      create: {
        sessionTaskId: taskId,
        roleSkillId: data.roleSkillId,
        benefitType: data.benefitType,
        fatigueCostReduction: data.fatigueCostReduction,
        notes: data.notes ?? null,
      },
      include: roleSkillInclude,
    })
  },

  deleteSkillAdvantage(taskId: string, roleSkillId: string) {
    return prisma.sessionTaskSkillAdvantage.delete({
      where: {
        sessionTaskId_roleSkillId: {
          sessionTaskId: taskId,
          roleSkillId,
        },
      },
      include: roleSkillInclude,
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
      include: {
        character: {
          include: {
            roleClass: {
              include: {
                skills: true,
              },
            },
          },
        },
      },
    })
  },

  findRollByTaskAndParticipant(taskId: string, participantId: string) {
    return prisma.sessionTaskRoll.findUnique({
      where: {
        sessionTaskId_sessionParticipantId: {
          sessionTaskId: taskId,
          sessionParticipantId: participantId,
        },
      },
    })
  },

  createRollAndApplyFatigue(data: {
    taskId: string
    participantId: string
    characterId: string
    rollValue: number
    advantageRollValue?: number | null
    effectiveRoll: number
    diceDifficulty: number
    isSuccess: boolean
    fatigueApplied: number
  }) {
    return prisma.$transaction(async (tx) => {
      const roll = await tx.sessionTaskRoll.create({
        data: {
          sessionTaskId: data.taskId,
          sessionParticipantId: data.participantId,
          rollValue: data.rollValue,
          advantageRollValue: data.advantageRollValue ?? null,
          effectiveRoll: data.effectiveRoll,
          diceDifficulty: data.diceDifficulty,
          isSuccess: data.isSuccess,
          fatigueApplied: data.fatigueApplied,
        },
        include: {
          sessionTask: {
            include: sessionTaskInclude,
          },
          sessionParticipant: {
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
        },
      })

      await tx.character.update({
        where: {
          id: data.characterId,
        },
        data: {
          currentFatigue: {
            increment: data.fatigueApplied,
          },
        },
      })

      return roll
    })
  },
}
