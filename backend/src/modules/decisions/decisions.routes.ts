import type { FastifyInstance, FastifyReply } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import type { CurrentUser } from '../../shared/types'
import { decisionsService } from './decisions.service'
import {
  createDecisionSchema,
  decisionParamsSchema,
  decisionSessionParamsSchema,
  evaluateDecisionSchema,
  updateDecisionSchema,
} from './decisions.schemas'
import {
  DecisionCharacterNotFoundError,
  DecisionCharacterNotParticipantError,
  DecisionEventNotFoundError,
  DecisionEventSessionMismatchError,
  DecisionForbiddenError,
  DecisionNotFoundError,
  DecisionSessionNotActiveError,
  DecisionSessionNotFoundError,
} from './decisions.errors'

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

function handleDecisionError(error: unknown, reply: FastifyReply) {
  if (
    error instanceof DecisionNotFoundError ||
    error instanceof DecisionSessionNotFoundError ||
    error instanceof DecisionEventNotFoundError ||
    error instanceof DecisionCharacterNotFoundError ||
    error instanceof DecisionCharacterNotParticipantError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof DecisionForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (error instanceof DecisionSessionNotActiveError) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  if (error instanceof DecisionEventSessionMismatchError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  throw error
}

export async function decisionsRoutes(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId/decisions',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = decisionSessionParamsSchema.safeParse(request.params)

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
        const decisions = await decisionsService.getSessionDecisions(
          paramsParsed.data.sessionId,
          currentUser,
        )

        return reply.status(200).send(decisions)
      } catch (error) {
        return handleDecisionError(error, reply)
      }
    },
  )

  app.get(
    '/decisions/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = decisionParamsSchema.safeParse(request.params)

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
        const decision = await decisionsService.getDecisionById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(decision)
      } catch (error) {
        return handleDecisionError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:sessionId/decisions',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = decisionSessionParamsSchema.safeParse(request.params)
      const bodyParsed = createDecisionSchema.safeParse(request.body)

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
        const decision = await decisionsService.createDecision(
          paramsParsed.data.sessionId,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(decision)
      } catch (error) {
        return handleDecisionError(error, reply)
      }
    },
  )

  app.patch(
    '/decisions/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = decisionParamsSchema.safeParse(request.params)
      const bodyParsed = updateDecisionSchema.safeParse(request.body)

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
        const decision = await decisionsService.updateDecision(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(decision)
      } catch (error) {
        return handleDecisionError(error, reply)
      }
    },
  )

  app.patch(
    '/decisions/:id/evaluate',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = decisionParamsSchema.safeParse(request.params)
      const bodyParsed = evaluateDecisionSchema.safeParse(request.body)

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
        const decision = await decisionsService.evaluateDecision(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(decision)
      } catch (error) {
        return handleDecisionError(error, reply)
      }
    },
  )

  app.delete(
    '/decisions/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = decisionParamsSchema.safeParse(request.params)

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
        await decisionsService.deleteDecision(paramsParsed.data.id, currentUser)

        return reply.status(204).send()
      } catch (error) {
        return handleDecisionError(error, reply)
      }
    },
  )
}