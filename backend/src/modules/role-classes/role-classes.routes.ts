import type { FastifyInstance } from 'fastify'

import {
  authMiddleware,
  getCurrentUser,
} from '../../middlewares/auth.middleware'

import {
  allowRoleClassForSessionSchema,
  createRoleClassSchema,
  roleClassParamsSchema,
  sessionParamsSchema,
  sessionRoleClassParamsSchema,
  updateRoleClassSchema,
} from './role-classes.schemas'

import { roleClassesService } from './role-classes.service'

import {
  InvalidSessionStatusForRoleClassesError,
  RoleClassAlreadyAllowedError,
  RoleClassForbiddenError,
  RoleClassInUseError,
  RoleClassNotAllowedError,
  RoleClassNotFoundError,
  RoleClassValidationError,
  SessionForbiddenError,
  SessionNotFoundError,
} from './role-classes.errors'

function handleRoleClassesError(error: unknown, reply: any) {
  if (
    error instanceof RoleClassNotFoundError
    || error instanceof SessionNotFoundError
    || error instanceof RoleClassNotAllowedError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (
    error instanceof RoleClassForbiddenError
    || error instanceof SessionForbiddenError
  ) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (
    error instanceof RoleClassValidationError
    || error instanceof RoleClassAlreadyAllowedError
  ) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (
    error instanceof InvalidSessionStatusForRoleClassesError
    || error instanceof RoleClassInUseError
  ) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  throw error
}

function getAuthorizedUser(request: any, reply: any) {
  const currentUser = getCurrentUser(request)

  if (!currentUser) {
    reply.status(401).send({
      message: 'Unauthorized',
    })

    return null
  }

  return currentUser
}

export async function roleClassesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware)

  app.get('/role-classes', async (request, reply) => {
    const currentUser = getAuthorizedUser(request, reply)

    if (!currentUser) {
      return
    }

    try {
      return await roleClassesService.getRoleClasses(currentUser)
    } catch (error) {
      return handleRoleClassesError(error, reply)
    }
  })

  app.get('/role-classes/:id', async (request, reply) => {
    const paramsParsed = roleClassParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    const currentUser = getAuthorizedUser(request, reply)

    if (!currentUser) {
      return
    }

    try {
      return await roleClassesService.getRoleClassById(
        paramsParsed.data.id,
        currentUser,
      )
    } catch (error) {
      return handleRoleClassesError(error, reply)
    }
  })

  app.post('/role-classes', async (request, reply) => {
    const bodyParsed = createRoleClassSchema.safeParse(request.body)

    if (!bodyParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: bodyParsed.error.flatten(),
      })
    }

    const currentUser = getAuthorizedUser(request, reply)

    if (!currentUser) {
      return
    }

    try {
      const roleClass = await roleClassesService.createRoleClass(
        bodyParsed.data,
        currentUser,
      )

      return reply.status(201).send(roleClass)
    } catch (error) {
      return handleRoleClassesError(error, reply)
    }
  })

  app.patch('/role-classes/:id', async (request, reply) => {
    const paramsParsed = roleClassParamsSchema.safeParse(request.params)
    const bodyParsed = updateRoleClassSchema.safeParse(request.body)

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

    const currentUser = getAuthorizedUser(request, reply)

    if (!currentUser) {
      return
    }

    try {
      return await roleClassesService.updateRoleClass(
        paramsParsed.data.id,
        bodyParsed.data,
        currentUser,
      )
    } catch (error) {
      return handleRoleClassesError(error, reply)
    }
  })

  app.delete('/role-classes/:id', async (request, reply) => {
    const paramsParsed = roleClassParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    const currentUser = getAuthorizedUser(request, reply)

    if (!currentUser) {
      return
    }

    try {
      await roleClassesService.deleteRoleClass(
        paramsParsed.data.id,
        currentUser,
      )

      return reply.status(204).send()
    } catch (error) {
      return handleRoleClassesError(error, reply)
    }
  })

  app.get('/sessions/:sessionId/role-classes', async (request, reply) => {
    const paramsParsed = sessionParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    const currentUser = getAuthorizedUser(request, reply)

    if (!currentUser) {
      return
    }

    try {
      return await roleClassesService.getSessionRoleClasses(
        paramsParsed.data.sessionId,
        currentUser,
      )
    } catch (error) {
      return handleRoleClassesError(error, reply)
    }
  })

  app.post('/sessions/:sessionId/role-classes', async (request, reply) => {
    const paramsParsed = sessionParamsSchema.safeParse(request.params)
    const bodyParsed = allowRoleClassForSessionSchema.safeParse(request.body)

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

    const currentUser = getAuthorizedUser(request, reply)

    if (!currentUser) {
      return
    }

    try {
      const allowedRoleClass =
        await roleClassesService.allowRoleClassForSession(
          paramsParsed.data.sessionId,
          bodyParsed.data,
          currentUser,
        )

      return reply.status(201).send(allowedRoleClass)
    } catch (error) {
      return handleRoleClassesError(error, reply)
    }
  })

  app.delete(
    '/sessions/:sessionId/role-classes/:roleClassId',
    async (request, reply) => {
      const paramsParsed = sessionRoleClassParamsSchema.safeParse(
        request.params,
      )

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getAuthorizedUser(request, reply)

      if (!currentUser) {
        return
      }

      try {
        await roleClassesService.removeRoleClassFromSession(
          paramsParsed.data.sessionId,
          paramsParsed.data.roleClassId,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleRoleClassesError(error, reply)
      }
    },
  )
}