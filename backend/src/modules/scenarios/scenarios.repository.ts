import { prisma } from '../../lib/prisma'
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
  createdBy: {
    select: userSelect,
  },
  tasks: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
}

export const scenariosRepository = {
  findMany() {
    return prisma.scenario.findMany({
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

  create(data: CreateScenarioInput, createdById: string) {
    return prisma.scenario.create({
      data: {
        ...data,
        createdById,
      },
      include: scenarioInclude,
    })
  },

  update(id: string, data: UpdateScenarioInput) {
    return prisma.scenario.update({
      where: { id },
      data,
      include: scenarioInclude,
    })
  },

  delete(id: string) {
    return prisma.scenario.delete({
      where: { id },
      include: scenarioInclude,
    })
  },

  addTask(scenarioId: string, data: CreateScenarioTaskInput) {
    return prisma.scenarioTask.create({
      data: {
        scenarioId,
        title: data.title,
        description: data.description,
        taskType: data.taskType,
        expectedResult: data.expectedResult,
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