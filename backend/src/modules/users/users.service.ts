import { usersRepository } from './users.repository'
import type { UpdateUserInput } from './users.schemas'
import {
  UserEmailAlreadyExistsError,
  UserForbiddenError,
  UserNotFoundError,
} from './users.errors'
import type { CurrentUser } from '../../shared/types'

export const usersService = {
  async getUsers(currentUser: CurrentUser) {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MODERATOR') {
      throw new UserForbiddenError()
    }

    return usersRepository.findMany()
  },

  async getUserById(id: string, currentUser: CurrentUser) {
    if (
      currentUser.role !== 'ADMIN' &&
      currentUser.role !== 'MODERATOR' &&
      currentUser.id !== id
    ) {
      throw new UserForbiddenError()
    }

    const user = await usersRepository.findById(id)

    if (!user) {
      throw new UserNotFoundError(id)
    }

    return user
  },

  async getCurrentUser(userId: string) {
    const user = await usersRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError(userId)
    }

    return user
  },

  async updateUser(id: string, data: UpdateUserInput, currentUser: CurrentUser) {
    const user = await usersRepository.findById(id)

    if (!user) {
      throw new UserNotFoundError(id)
    }

    const isAdmin = currentUser.role === 'ADMIN'
    const isOwner = currentUser.id === id

    if (!isAdmin && !isOwner) {
      throw new UserForbiddenError()
    }

    if (!isAdmin && data.role) {
      throw new UserForbiddenError()
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await usersRepository.findByEmail(data.email)

      if (existingUser) {
        throw new UserEmailAlreadyExistsError(data.email)
      }
    }

    return usersRepository.update(id, data)
  },

  async deleteUser(id: string, currentUser: CurrentUser) {
    if (currentUser.role !== 'ADMIN') {
      throw new UserForbiddenError()
    }

    const user = await usersRepository.findById(id)

    if (!user) {
      throw new UserNotFoundError(id)
    }

    return usersRepository.delete(id)
  },
}