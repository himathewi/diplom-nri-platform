import type { CurrentUser } from '../../shared/types'

import {
  UserAdminDeleteForbiddenError,
  UserAdminRoleProtectedError,
  UserEmailAlreadyExistsError,
  UserForbiddenError,
  UserNotFoundError,
  UserRoleUpdateForbiddenError,
} from './users.errors'

import { usersRepository } from './users.repository'

import type { UpdateUserInput } from './users.schemas'

function isAdmin(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN'
}

function isModerator(currentUser: CurrentUser) {
  return currentUser.role === 'MODERATOR'
}

function canReadUsers(currentUser: CurrentUser) {
  return isAdmin(currentUser) || isModerator(currentUser)
}

function canReadUserById(userId: string, currentUser: CurrentUser) {
  if (isAdmin(currentUser) || isModerator(currentUser)) {
    return true
  }

  return currentUser.id === userId
}

function canUpdateUser(userId: string, currentUser: CurrentUser) {
  if (isAdmin(currentUser)) {
    return true
  }

  return currentUser.id === userId
}

export const usersService = {
  async getUsers(currentUser: CurrentUser) {
    if (!canReadUsers(currentUser)) {
      throw new UserForbiddenError()
    }

    return usersRepository.findMany()
  },

  async getUserById(id: string, currentUser: CurrentUser) {
    if (!canReadUserById(id, currentUser)) {
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

    if (!canUpdateUser(id, currentUser)) {
      throw new UserForbiddenError()
    }

    if (data.role !== undefined && !isAdmin(currentUser)) {
      throw new UserRoleUpdateForbiddenError()
    }

    if (data.role !== undefined && user.role === 'ADMIN') {
      throw new UserAdminRoleProtectedError()
    }

    if (data.email !== undefined && data.email !== user.email) {
      const existingUser = await usersRepository.findByEmail(data.email)

      if (existingUser) {
        throw new UserEmailAlreadyExistsError(data.email)
      }
    }

    return usersRepository.update(id, data)
  },

  async deleteUser(id: string, currentUser: CurrentUser) {
    if (!isAdmin(currentUser)) {
      throw new UserForbiddenError()
    }

    const user = await usersRepository.findById(id)

    if (!user) {
      throw new UserNotFoundError(id)
    }

    if (user.role === 'ADMIN') {
      throw new UserAdminDeleteForbiddenError()
    }

    return usersRepository.delete(id)
  },
}