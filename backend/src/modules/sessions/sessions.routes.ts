import type { FastifyInstance, FastifyReply } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import type { CurrentUser } from '../../shared/types'
import { sessionsService } from './sessions.service'
import {
  addSessionParticipantSchema,
  createSessionSchema,
  sessionParamsSchema,
  sessionParticipantParamsSchema,
  updateSessionSchema,
} from './sessions.schemas'
import {
  CharacterNotFoundForSessionError,
  ScenarioNotFoundForSessionError,
  SessionAlreadyFinishedError,
  SessionAlreadyStartedError,
  SessionForbiddenError,
  SessionNotActiveError,
  SessionNotFoundError,
  SessionParticipantAlreadyExistsError,
  SessionParticipantNotFoundError,
  TeamNotFoundForSessionError,
} from './sessions.errors'

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

function handleSessionError(error: unknown, reply: FastifyReply){
  if (
    error instanceof SessionNotFoundError ||
    error instanceof SessionParticipantNotFoundError ||
    error instanceof ScenarioNotFoundForSessionError ||
    error instanceof TeamNotFoundForSessionError ||
    error instanceof CharacterNotFoundForSessionError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof SessionForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (
    error instanceof SessionAlreadyStartedError ||
    error instanceof SessionAlreadyFinishedError ||
    error instanceof SessionNotActiveError ||
    error instanceof SessionParticipantAlreadyExistsError
  ) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  throw error
}

export async function sessionsRoutes(app: FastifyInstance) {
  app.get(
    '/sessions',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const currentUser = getCurrentUserOrUnauthorized(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      const sessions = await sessionsService.getSessions(currentUser)

      return reply.status(200).send(sessions)
    },
  )

  app.get(
    '/sessions/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionParamsSchema.safeParse(request.params)

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
        const session = await sessionsService.getSessionById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(session)
      } catch (error) {
        return handleSessionError(error, reply)
      }
    },
  )

  app.post(
    '/sessions',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const bodyParsed = createSessionSchema.safeParse(request.body)

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
        const session = await sessionsService.createSession(
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(session)
      } catch (error) {
        return handleSessionError(error, reply)
      }
    },
  )

  app.patch(
    '/sessions/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionParamsSchema.safeParse(request.params)
      const bodyParsed = updateSessionSchema.safeParse(request.body)

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
        const session = await sessionsService.updateSession(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(session)
      } catch (error) {
        return handleSessionError(error, reply)
      }
    },
  )

  app.delete(
    '/sessions/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionParamsSchema.safeParse(request.params)

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
        await sessionsService.deleteSession(paramsParsed.data.id, currentUser)

        return reply.status(204).send()
      } catch (error) {
        return handleSessionError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:id/start',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionParamsSchema.safeParse(request.params)

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
        const session = await sessionsService.startSession(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(session)
      } catch (error) {
        return handleSessionError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:id/finish',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionParamsSchema.safeParse(request.params)

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
        const session = await sessionsService.finishSession(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(session)
      } catch (error) {
        return handleSessionError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:id/participants',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionParamsSchema.safeParse(request.params)
      const bodyParsed = addSessionParticipantSchema.safeParse(request.body)

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
        const participant = await sessionsService.addParticipant(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(participant)
      } catch (error) {
        return handleSessionError(error, reply)
      }
    },
  )

  app.delete(
    '/sessions/:id/participants/:participantId',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionParticipantParamsSchema.safeParse(request.params)

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
        await sessionsService.removeParticipant(
          paramsParsed.data.id,
          paramsParsed.data.participantId,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleSessionError(error, reply)
      }
    },
  )
}