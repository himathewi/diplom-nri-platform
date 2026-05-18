import { prisma } from '../../lib/prisma'
import type { UpdateUserInput } from './users.schemas'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

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
      where: { id },
      select: userSelect,
    })
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    })
  },

  delete(id: string) {
    return prisma.user.delete({
      where: { id },
      select: userSelect,
    })
  },
}