import { prisma } from '../../lib/prisma'

import type {
  AddTaskTemplateSkillAdvantageInput,
  AddTaskTemplateRequiredItemInput,
  CreateTaskTemplateInput,
  UpdateTaskTemplateInput,
} from './task-templates.schemas'

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

const directionSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  isActive: true,
} as const

const requiredItemInclude = {
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
  direction: {
    select: directionSelect,
  },
  createdBy: {
    select: safeUserSelect,
  },
  requiredItems: {
    include: requiredItemInclude,
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

export const taskTemplatesRepository = {
  findManyForAdmin() {
    return prisma.taskTemplate.findMany({
      include: taskTemplateInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findManyForModerator(moderatorId: string) {
    return prisma.taskTemplate.findMany({
      where: {
        OR: [
          {
            isPublic: true,
          },
          {
            createdById: moderatorId,
          },
        ],
      },
      include: taskTemplateInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findManyForParticipant() {
    return prisma.taskTemplate.findMany({
      where: {
        isPublic: true,
        isActive: true,
      },
      include: taskTemplateInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findById(taskTemplateId: string) {
    return prisma.taskTemplate.findUnique({
      where: {
        id: taskTemplateId,
      },
      include: taskTemplateInclude,
    })
  },

  findDirectionById(directionId: string) {
    return prisma.scenarioDirection.findUnique({
      where: {
        id: directionId,
      },
      select: directionSelect,
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

  create(data: CreateTaskTemplateInput, createdById: string) {
    return prisma.taskTemplate.create({
      data: {
        title: data.title,
        description: data.description,
        taskType: data.taskType,
        directionId: data.directionId ?? null,
        createdById,
        difficulty: data.difficulty,
        fatigueCost: data.fatigueCost,
        diceDifficulty: data.diceDifficulty ?? null,
        expectedResult: data.expectedResult ?? null,
        moderatorNotes: data.moderatorNotes ?? null,
        isPublic: data.isPublic,
        isActive: data.isActive,
      },
      include: taskTemplateInclude,
    })
  },

  update(taskTemplateId: string, data: UpdateTaskTemplateInput) {
    return prisma.taskTemplate.update({
      where: {
        id: taskTemplateId,
      },
      data: {
        ...(data.title !== undefined && {
          title: data.title,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.taskType !== undefined && {
          taskType: data.taskType,
        }),
        ...(data.directionId !== undefined && {
          directionId: data.directionId,
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
        ...(data.expectedResult !== undefined && {
          expectedResult: data.expectedResult,
        }),
        ...(data.moderatorNotes !== undefined && {
          moderatorNotes: data.moderatorNotes,
        }),
        ...(data.isPublic !== undefined && {
          isPublic: data.isPublic,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
      include: taskTemplateInclude,
    })
  },

  deactivate(taskTemplateId: string) {
    return prisma.taskTemplate.update({
      where: {
        id: taskTemplateId,
      },
      data: {
        isActive: false,
      },
      include: taskTemplateInclude,
    })
  },

  findRequiredItem(taskTemplateId: string, itemId: string) {
    return prisma.taskTemplateRequiredItem.findUnique({
      where: {
        taskTemplateId_itemId: {
          taskTemplateId,
          itemId,
        },
      },
      include: requiredItemInclude,
    })
  },

  upsertRequiredItem(
    taskTemplateId: string,
    data: AddTaskTemplateRequiredItemInput,
  ) {
    return prisma.taskTemplateRequiredItem.upsert({
      where: {
        taskTemplateId_itemId: {
          taskTemplateId,
          itemId: data.itemId,
        },
      },
      update: {
        quantity: data.quantity,
        notes: data.notes ?? null,
      },
      create: {
        taskTemplateId,
        itemId: data.itemId,
        quantity: data.quantity,
        notes: data.notes ?? null,
      },
      include: requiredItemInclude,
    })
  },

  deleteRequiredItem(taskTemplateId: string, itemId: string) {
    return prisma.taskTemplateRequiredItem.delete({
      where: {
        taskTemplateId_itemId: {
          taskTemplateId,
          itemId,
        },
      },
      include: requiredItemInclude,
    })
  },

  findSkillAdvantage(taskTemplateId: string, roleSkillId: string) {
    return prisma.taskTemplateSkillAdvantage.findUnique({
      where: {
        taskTemplateId_roleSkillId: {
          taskTemplateId,
          roleSkillId,
        },
      },
      include: roleSkillInclude,
    })
  },

  upsertSkillAdvantage(
    taskTemplateId: string,
    data: AddTaskTemplateSkillAdvantageInput,
  ) {
    return prisma.taskTemplateSkillAdvantage.upsert({
      where: {
        taskTemplateId_roleSkillId: {
          taskTemplateId,
          roleSkillId: data.roleSkillId,
        },
      },
      update: {
        benefitType: data.benefitType,
        fatigueCostReduction: data.fatigueCostReduction,
        notes: data.notes ?? null,
      },
      create: {
        taskTemplateId,
        roleSkillId: data.roleSkillId,
        benefitType: data.benefitType,
        fatigueCostReduction: data.fatigueCostReduction,
        notes: data.notes ?? null,
      },
      include: roleSkillInclude,
    })
  },

  deleteSkillAdvantage(taskTemplateId: string, roleSkillId: string) {
    return prisma.taskTemplateSkillAdvantage.delete({
      where: {
        taskTemplateId_roleSkillId: {
          taskTemplateId,
          roleSkillId,
        },
      },
      include: roleSkillInclude,
    })
  },
}
