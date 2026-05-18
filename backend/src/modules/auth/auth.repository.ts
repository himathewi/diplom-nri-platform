import { prisma } from '../../lib/prisma'
import type { RegisterInput } from './auth.schemas'

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  },

  createUser(data: RegisterInput & { password: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  },
}