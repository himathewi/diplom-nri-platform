import type { FastifyInstance, FastifyReply } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import { teamMetricsService } from './team-metrics.service'
import {
  createTeamMetricSchema,
  teamMetricParamsSchema,
  teamMetricSessionParamsSchema,
  updateTeamMetricSchema,
} from './team-metrics.schemas'
import {
  TeamMetricAlreadyExistsError,
  TeamMetricForbiddenError,
  TeamMetricNotFoundError,
  TeamMetricSessionNotFoundError,
  TeamMetricSessionNotReadyError,
} from './team-metrics.errors'

function getCurrentUserOrUnauthorized(request: Parameters<typeof getAuthUserId>[0]) {
  const currentUserId = getAuthUserId(request)
  const currentUserRole = getAuthUserRole(request)

  if (!currentUserId) {
    return null
  }

  return {
    id: currentUserId,
    role: currentUserRole,
  }
}

function handleTeamMetricError(error: unknown, reply: FastifyReply) {
  if (
    error instanceof TeamMetricNotFoundError ||
    error instanceof TeamMetricSessionNotFoundError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof TeamMetricForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (
    error instanceof TeamMetricAlreadyExistsError ||
    error instanceof TeamMetricSessionNotReadyError
  ) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  throw error
}

export async function teamMetricsRoutes(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId/metrics',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamMetricSessionParamsSchema.safeParse(request.params)

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
        const metric = await teamMetricsService.getSessionMetric(
          paramsParsed.data.sessionId,
          currentUser,
        )

        return reply.status(200).send(metric)
      } catch (error) {
        return handleTeamMetricError(error, reply)
      }
    },
  )

  app.get(
    '/team-metrics/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamMetricParamsSchema.safeParse(request.params)

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
        const metric = await teamMetricsService.getMetricById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(metric)
      } catch (error) {
        return handleTeamMetricError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:sessionId/metrics',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamMetricSessionParamsSchema.safeParse(request.params)
      const bodyParsed = createTeamMetricSchema.safeParse(request.body)

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
        const metric = await teamMetricsService.createMetric(
          paramsParsed.data.sessionId,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(metric)
      } catch (error) {
        return handleTeamMetricError(error, reply)
      }
    },
  )

  app.patch(
    '/team-metrics/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamMetricParamsSchema.safeParse(request.params)
      const bodyParsed = updateTeamMetricSchema.safeParse(request.body)

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
        const metric = await teamMetricsService.updateMetric(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(metric)
      } catch (error) {
        return handleTeamMetricError(error, reply)
      }
    },
  )

  app.delete(
    '/team-metrics/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamMetricParamsSchema.safeParse(request.params)

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
        await teamMetricsService.deleteMetric(paramsParsed.data.id, currentUser)

        return reply.status(204).send()
      } catch (error) {
        return handleTeamMetricError(error, reply)
      }
    },
  )
}