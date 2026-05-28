import { prisma } from '../../lib/prisma'

import type { UpdateUserInput } from './users.schemas'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

export const usersRepository = {
  findMany() {
    return prisma.user.findMany({
      select: userSelect,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: userSelect,
    })
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      select: userSelect,
    })
  },

  update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        ...(data.email !== undefined && {
          email: data.email,
        }),
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.role !== undefined && {
          role: data.role,
        }),
      },
      select: userSelect,
    })
  },

  delete(id: string) {
    return prisma.user.delete({
      where: {
        id,
      },
      select: userSelect,
    })
  },
}