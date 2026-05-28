import { prisma } from '../../lib/prisma'

import type {
  CreateRoleClassInput,
  UpdateRoleClassInput,
} from './role-classes.schemas'

const roleClassSelect = {
  id: true,
  name: true,
  description: true,
} as const

const sessionForAccessSelect = {
  id: true,
  status: true,
  moderatorId: true,
  team: {
    select: {
      id: true,
      members: {
        select: {
          userId: true,
        },
      },
    },
  },
  participants: {
    select: {
      userId: true,
    },
  },
  allowedRoleClasses: {
    include: {
      roleClass: {
        select: roleClassSelect,
      },
    },
    orderBy: {
      roleClass: {
        name: 'asc' as const,
      },
    },
  },
} as const

export const roleClassesRepository = {
  findAll() {
    return prisma.roleClass.findMany({
      select: roleClassSelect,
      orderBy: {
        name: 'asc',
      },
    })
  },

  findById(roleClassId: string) {
    return prisma.roleClass.findUnique({
      where: {
        id: roleClassId,
      },
      select: roleClassSelect,
    })
  },

  findByName(name: string) {
    return prisma.roleClass.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      select: roleClassSelect,
    })
  },

  create(data: CreateRoleClassInput) {
    return prisma.roleClass.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
      select: roleClassSelect,
    })
  },

  update(roleClassId: string, data: UpdateRoleClassInput) {
    return prisma.roleClass.update({
      where: {
        id: roleClassId,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
      select: roleClassSelect,
    })
  },

  delete(roleClassId: string) {
    return prisma.roleClass.delete({
      where: {
        id: roleClassId,
      },
      select: roleClassSelect,
    })
  },

  countCharactersByRoleClassId(roleClassId: string) {
    return prisma.character.count({
      where: {
        roleClassId,
      },
    })
  },

  countAllowedSessionsByRoleClassId(roleClassId: string) {
    return prisma.sessionAllowedRoleClass.count({
      where: {
        roleClassId,
      },
    })
  },

  findSessionForAccess(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      select: sessionForAccessSelect,
    })
  },

  findSessionAllowedRoleClasses(sessionId: string) {
    return prisma.sessionAllowedRoleClass.findMany({
      where: {
        sessionId,
      },
      include: {
        roleClass: {
          select: roleClassSelect,
        },
      },
      orderBy: {
        roleClass: {
          name: 'asc',
        },
      },
    })
  },

  findSessionAllowedRoleClass(sessionId: string, roleClassId: string) {
    return prisma.sessionAllowedRoleClass.findUnique({
      where: {
        sessionId_roleClassId: {
          sessionId,
          roleClassId,
        },
      },
      include: {
        roleClass: {
          select: roleClassSelect,
        },
      },
    })
  },

  createSessionAllowedRoleClass(sessionId: string, roleClassId: string) {
    return prisma.sessionAllowedRoleClass.create({
      data: {
        sessionId,
        roleClassId,
      },
      include: {
        roleClass: {
          select: roleClassSelect,
        },
      },
    })
  },

  deleteSessionAllowedRoleClass(sessionId: string, roleClassId: string) {
    return prisma.sessionAllowedRoleClass.delete({
      where: {
        sessionId_roleClassId: {
          sessionId,
          roleClassId,
        },
      },
      include: {
        roleClass: {
          select: roleClassSelect,
        },
      },
    })
  },
}