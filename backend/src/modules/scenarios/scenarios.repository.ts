import { prisma } from '../../lib/prisma'
import type { CurrentUser } from '../../shared/types'
import type {
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

  countActiveSessions(scenarioId: string) {
    return prisma.gameSession.count({
      where: {
        scenarioId,
        status: 'ACTIVE',
      },
    })
  },

  addTask(scenarioId: string, data: CreateScenarioTaskInput) {
    return prisma.scenarioTask.create({
      data: {
        scenarioId,
        title: data.title,
        description: data.description,
        taskType: data.taskType,
        difficulty: data.difficulty,
        fatigueCost: data.fatigueCost,
        expectedResult: data.expectedResult,
        moderatorNotes: data.moderatorNotes,
        isVisibleByDefault: data.isVisibleByDefault,
      },
    })
  },

  findTaskById(taskId: string) {
    return prisma.scenarioTask.findUnique({
      where: { id: taskId },
    })
  },

  deleteTask(taskId: string) {
    return prisma.scenarioTask.delete({
      where: { id: taskId },
    })
  },
}