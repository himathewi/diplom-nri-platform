import { prisma } from '../../lib/prisma'
import type { CurrentUser } from '../../shared/types'
import type {
  AddScenarioTaskSkillAdvantageInput,
  CreateScenarioInput,
  CreateScenarioTaskInput,
  UpdateScenarioInput,
} from './scenarios.schemas'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

const scenarioInclude = {
  direction: true,
  createdBy: {
    select: userSelect,
  },
  tasks: {
    include: {
      requiredItems: {
        include: {
          item: true,
        },
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
      advantageSkills: {
        include: {
          roleSkill: {
            include: {
              roleClass: true,
            },
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
}

function getScenarioWhereForUser(currentUser: CurrentUser) {
  if (currentUser.role === 'ADMIN') {
    return {}
  }

  if (currentUser.role === 'MODERATOR') {
    return {
      OR: [
        { isPublicTemplate: true },
        { createdById: currentUser.id },
      ],
    }
  }

  return {
    OR: [
      { isPublicTemplate: true },
      {
        sessions: {
          some: {
            participants: {
              some: {
                userId: currentUser.id,
              },
            },
          },
        },
      },
    ],
  }
}

export const scenariosRepository = {
  findMany(currentUser: CurrentUser) {
    return prisma.scenario.findMany({
      where: getScenarioWhereForUser(currentUser),
      include: scenarioInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findById(id: string) {
    return prisma.scenario.findUnique({
      where: { id },
      include: scenarioInclude,
    })
  },

  findDirectionById(directionId: string) {
    return prisma.scenarioDirection.findUnique({
      where: { id: directionId },
    })
  },

  findTaskTemplateById(taskTemplateId: string) {
    return prisma.taskTemplate.findUnique({
      where: { id: taskTemplateId },
      include: {
        requiredItems: true,
      },
    })
  },

  findItemById(itemId: string) {
    return prisma.item.findUnique({
      where: { id: itemId },
    })
  },

  findRoleSkillById(roleSkillId: string) {
    return prisma.roleClassSkill.findUnique({
      where: { id: roleSkillId },
      include: {
        roleClass: true,
      },
    })
  },

  create(data: CreateScenarioInput, createdById: string) {
    return prisma.scenario.create({
      data: {
        title: data.title,
        description: data.description,
        goal: data.goal,
        difficulty: data.difficulty,
        directionId: data.directionId,
        sourceType: data.sourceType,
        isPublicTemplate: data.isPublicTemplate,
        createdById,
      },
      include: scenarioInclude,
    })
  },

  update(id: string, data: UpdateScenarioInput) {
    return prisma.scenario.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        goal: data.goal,
        difficulty: data.difficulty,
        directionId: data.directionId,
        sourceType: data.sourceType,
        isPublicTemplate: data.isPublicTemplate,
      },
      include: scenarioInclude,
    })
  },

  delete(id: string) {
    return prisma.scenario.delete({
      where: { id },
      include: scenarioInclude,
    })
  },

  copy(id: string, createdById: string) {
    return prisma.$transaction(async (tx) => {
      const source = await tx.scenario.findUnique({
        where: { id },
        include: {
          tasks: {
            include: {
              requiredItems: true,
              advantageSkills: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      if (!source) {
        return null
      }

      const copiedScenario = await tx.scenario.create({
        data: {
          title: source.title,
          description: source.description,
          goal: source.goal,
          difficulty: source.difficulty,
          directionId: source.directionId,
          sourceType: 'CUSTOM',
          isPublicTemplate: false,
          createdById,
          basedOnScenarioId: source.id,
          tasks: {
            create: source.tasks.map((task) => ({
              title: task.title,
              description: task.description,
              taskType: task.taskType,
              createdById,
              sourceTemplateId: task.sourceTemplateId,
              difficulty: task.difficulty,
              fatigueCost: task.fatigueCost,
              diceDifficulty: task.diceDifficulty,
              expectedResult: task.expectedResult,
              moderatorNotes: task.moderatorNotes,
              isVisibleByDefault: task.isVisibleByDefault,
              isPublic: false,
              isActive: task.isActive,
              requiredItems: {
                create: task.requiredItems.map((requiredItem) => ({
                  itemId: requiredItem.itemId,
                  quantity: requiredItem.quantity,
                  notes: requiredItem.notes,
                })),
              },
              advantageSkills: {
                create: task.advantageSkills.map((advantage) => ({
                  roleSkillId: advantage.roleSkillId,
                  benefitType: advantage.benefitType,
                  fatigueCostReduction: advantage.fatigueCostReduction,
                  notes: advantage.notes,
                })),
              },
            })),
          },
        },
      })

      return tx.scenario.findUnique({
        where: {
          id: copiedScenario.id,
        },
        include: scenarioInclude,
      })
    })
  },

  countActiveSessions(scenarioId: string) {
    return prisma.gameSession.count({
      where: {
        scenarioId,
        status: 'ACTIVE',
      },
    })
  },

  addTask(
    scenarioId: string,
    data: CreateScenarioTaskInput,
    createdById: string,
  ) {
    return prisma.scenarioTask.create({
      data: {
        scenarioId,
        title: data.title,
        description: data.description,
        taskType: data.taskType,
        createdById,
        sourceTemplateId: data.sourceTemplateId ?? null,
        difficulty: data.difficulty,
        fatigueCost: data.fatigueCost,
        diceDifficulty: data.diceDifficulty ?? null,
        expectedResult: data.expectedResult,
        moderatorNotes: data.moderatorNotes,
        isVisibleByDefault: data.isVisibleByDefault,
        requiredItems:
          data.requiredItems && data.requiredItems.length > 0
            ? {
                create: data.requiredItems.map((item) => ({
                  itemId: item.itemId,
                  quantity: item.quantity,
                  notes: item.notes ?? null,
                })),
              }
            : undefined,
        advantageSkills:
          data.advantageSkills && data.advantageSkills.length > 0
            ? {
                create: data.advantageSkills.map((advantage) => ({
                  roleSkillId: advantage.roleSkillId,
                  benefitType: advantage.benefitType,
                  fatigueCostReduction: advantage.fatigueCostReduction,
                  notes: advantage.notes ?? null,
                })),
              }
            : undefined,
      },
      include: {
        requiredItems: {
          include: {
            item: true,
          },
        },
        advantageSkills: {
          include: {
            roleSkill: {
              include: {
                roleClass: true,
              },
            },
          },
        },
        sourceTemplate: true,
      },
    })
  },

  findTaskById(taskId: string) {
    return prisma.scenarioTask.findUnique({
      where: { id: taskId },
    })
  },

  findSkillAdvantage(taskId: string, roleSkillId: string) {
    return prisma.scenarioTaskSkillAdvantage.findUnique({
      where: {
        taskId_roleSkillId: {
          taskId,
          roleSkillId,
        },
      },
      include: {
        roleSkill: {
          include: {
            roleClass: true,
          },
        },
      },
    })
  },

  upsertSkillAdvantage(
    taskId: string,
    data: AddScenarioTaskSkillAdvantageInput,
  ) {
    return prisma.scenarioTaskSkillAdvantage.upsert({
      where: {
        taskId_roleSkillId: {
          taskId,
          roleSkillId: data.roleSkillId,
        },
      },
      update: {
        benefitType: data.benefitType,
        fatigueCostReduction: data.fatigueCostReduction,
        notes: data.notes ?? null,
      },
      create: {
        taskId,
        roleSkillId: data.roleSkillId,
        benefitType: data.benefitType,
        fatigueCostReduction: data.fatigueCostReduction,
        notes: data.notes ?? null,
      },
      include: {
        roleSkill: {
          include: {
            roleClass: true,
          },
        },
      },
    })
  },

  deleteSkillAdvantage(taskId: string, roleSkillId: string) {
    return prisma.scenarioTaskSkillAdvantage.delete({
      where: {
        taskId_roleSkillId: {
          taskId,
          roleSkillId,
        },
      },
      include: {
        roleSkill: {
          include: {
            roleClass: true,
          },
        },
      },
    })
  },

  deleteTask(taskId: string) {
    return prisma.scenarioTask.delete({
      where: { id: taskId },
    })
  },
}
