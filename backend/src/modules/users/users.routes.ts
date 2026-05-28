import type { FastifyInstance } from 'fastify'

import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'

import type { CurrentUser } from '../../shared/types'

import {
  UserEmailAlreadyExistsError,
  UserForbiddenError,
  UserNotFoundError,
} from './users.errors'

import { updateUserSchema, userParamsSchema } from './users.schemas'

import { usersService } from './users.service'

function getCurrentUserFromRequest(request: Parameters<typeof getAuthUserId>[0]) {
  const currentUserId = getAuthUserId(request)
  const currentUserRole = getAuthUserRole(request)

  if (!currentUserId || !currentUserRole) {
    return null
  }

  return {
    id: currentUserId,
    role: currentUserRole as CurrentUser['role'],
  }
}

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/users',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const currentUser = getCurrentUserFromRequest(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const users = await usersService.getUsers(currentUser)

        return reply.status(200).send(users)
      } catch (error) {
        if (error instanceof UserForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.get(
    '/users/me',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const currentUser = getCurrentUserFromRequest(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const user = await usersService.getCurrentUser(currentUser.id)

        return reply.status(200).send(user)
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.get(
    '/users/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = userParamsSchema.safeParse(request.params)

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUserFromRequest(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const user = await usersService.getUserById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(user)
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof UserForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.patch(
    '/users/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = userParamsSchema.safeParse(request.params)
      const bodyParsed = updateUserSchema.safeParse(request.body)

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      if (!bodyParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: bodyParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUserFromRequest(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const user = await usersService.updateUser(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(user)
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof UserForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        if (error instanceof UserEmailAlreadyExistsError) {
          return reply.status(409).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.delete(
    '/users/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = userParamsSchema.safeParse(request.params)

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUserFromRequest(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        await usersService.deleteUser(paramsParsed.data.id, currentUser)

        return reply.status(204).send()
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof UserForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )
}