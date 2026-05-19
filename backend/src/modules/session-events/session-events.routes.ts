import type { FastifyInstance, FastifyReply } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import type { CurrentUser } from '../../shared/types'
import { sessionEventsService } from './session-events.service'
import {
  createSessionEventSchema,
  sessionEventParamsSchema,
  sessionEventSessionParamsSchema,
  updateSessionEventSchema,
} from './session-events.schemas'
import {
  SessionEventForbiddenError,
  SessionEventNotFoundError,
  SessionEventSessionAlreadyFinishedError,
  SessionEventSessionNotActiveError,
  SessionEventSessionNotFoundError,
} from './session-events.errors'

function getCurrentUserOrUnauthorized(request: Parameters<typeof getAuthUserId>[0]): CurrentUser | null {
  const currentUserId = getAuthUserId(request)
  const currentUserRole = getAuthUserRole(request)

  if (!currentUserId) {
    return null
  }

  return {
    id: currentUserId,
    role: currentUserRole as CurrentUser['role'],
  }
}

function handleSessionEventError(error: unknown, reply: FastifyReply) {
  if (
    error instanceof SessionEventNotFoundError ||
    error instanceof SessionEventSessionNotFoundError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof SessionEventForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (
    error instanceof SessionEventSessionNotActiveError ||
    error instanceof SessionEventSessionAlreadyFinishedError
  ) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  throw error
}

export async function sessionEventsRoutes(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId/events',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionEventSessionParamsSchema.safeParse(
        request.params,
      )

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUserOrUnauthorized(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const events = await sessionEventsService.getSessionEvents(
          paramsParsed.data.sessionId,
          currentUser,
        )

        return reply.status(200).send(events)
      } catch (error) {
        return handleSessionEventError(error, reply)
      }
    },
  )

  app.get(
    '/session-events/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionEventParamsSchema.safeParse(request.params)

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUserOrUnauthorized(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const event = await sessionEventsService.getSessionEventById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(event)
      } catch (error) {
        return handleSessionEventError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:sessionId/events',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionEventSessionParamsSchema.safeParse(
        request.params,
      )
      const bodyParsed = createSessionEventSchema.safeParse(request.body)

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

      const currentUser = getCurrentUserOrUnauthorized(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const event = await sessionEventsService.createSessionEvent(
          paramsParsed.data.sessionId,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(event)
      } catch (error) {
        return handleSessionEventError(error, reply)
      }
    },
  )

  app.patch(
    '/session-events/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionEventParamsSchema.safeParse(request.params)
      const bodyParsed = updateSessionEventSchema.safeParse(request.body)

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

      const currentUser = getCurrentUserOrUnauthorized(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const event = await sessionEventsService.updateSessionEvent(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(event)
      } catch (error) {
        return handleSessionEventError(error, reply)
      }
    },
  )

  app.delete(
    '/session-events/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionEventParamsSchema.safeParse(request.params)

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUserOrUnauthorized(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        await sessionEventsService.deleteSessionEvent(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleSessionEventError(error, reply)
      }
    },
  )
}