import type { FastifyInstance } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import type { CurrentUser } from '../../shared/types'
import { usersService } from './users.service'
import { updateUserSchema, userParamsSchema } from './users.schemas'
import {
  UserEmailAlreadyExistsError,
  UserForbiddenError,
  UserNotFoundError,
} from './users.errors'


export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/users',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const currentUserId = getAuthUserId(request)
      const currentUserRole = getAuthUserRole(request)

      if (!currentUserId) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const users = await usersService.getUsers({
          id: currentUserId,
          role: currentUserRole as CurrentUser['role'],
        })

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
      const currentUserId = getAuthUserId(request)

      if (!currentUserId) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const user = await usersService.getCurrentUser(currentUserId)

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

      const currentUserId = getAuthUserId(request)
      const currentUserRole = getAuthUserRole(request)

      if (!currentUserId) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const user = await usersService.getUserById(paramsParsed.data.id, {
          id: currentUserId,
          role: currentUserRole as CurrentUser['role'],
        })

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

      const currentUserId = getAuthUserId(request)
      const currentUserRole = getAuthUserRole(request)

      if (!currentUserId) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const user = await usersService.updateUser(
          paramsParsed.data.id,
          bodyParsed.data,
          {
            id: currentUserId,
            role: currentUserRole as CurrentUser['role'],
          },
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

      const currentUserId = getAuthUserId(request)
      const currentUserRole = getAuthUserRole(request)

      if (!currentUserId) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        await usersService.deleteUser(paramsParsed.data.id, {
          id: currentUserId,
          role: currentUserRole as CurrentUser['role'],
        })

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