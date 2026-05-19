import type { FastifyInstance, FastifyReply } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import type { CurrentUser } from '../../shared/types'
import { reportsService } from './reports.service'
import {
  createReportSchema,
  reportParamsSchema,
  reportSessionParamsSchema,
  updateReportSchema,
} from './reports.schemas'
import {
  ReportAlreadyExistsError,
  ReportForbiddenError,
  ReportNotFoundError,
  ReportSessionNotFinishedError,
  ReportSessionNotFoundError,
} from './reports.errors'

function getCurrentUserOrUnauthorized(
  request: Parameters<typeof getAuthUserId>[0],
): CurrentUser | null {
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

function handleReportError(error: unknown, reply: FastifyReply) {
  if (
    error instanceof ReportNotFoundError ||
    error instanceof ReportSessionNotFoundError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof ReportForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (
    error instanceof ReportAlreadyExistsError ||
    error instanceof ReportSessionNotFinishedError
  ) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  throw error
}

export async function reportsRoutes(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId/report',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = reportSessionParamsSchema.safeParse(request.params)

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
        const report = await reportsService.getSessionReport(
          paramsParsed.data.sessionId,
          currentUser,
        )

        return reply.status(200).send(report)
      } catch (error) {
        return handleReportError(error, reply)
      }
    },
  )

  app.get(
    '/reports/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = reportParamsSchema.safeParse(request.params)

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
        const report = await reportsService.getReportById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(report)
      } catch (error) {
        return handleReportError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:sessionId/report',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = reportSessionParamsSchema.safeParse(request.params)
      const bodyParsed = createReportSchema.safeParse(request.body ?? {})

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
        const report = await reportsService.createReport(
          paramsParsed.data.sessionId,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(report)
      } catch (error) {
        return handleReportError(error, reply)
      }
    },
  )

  app.patch(
    '/reports/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = reportParamsSchema.safeParse(request.params)
      const bodyParsed = updateReportSchema.safeParse(request.body)

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
        const report = await reportsService.updateReport(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(report)
      } catch (error) {
        return handleReportError(error, reply)
      }
    },
  )

  app.delete(
    '/reports/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = reportParamsSchema.safeParse(request.params)

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
        await reportsService.deleteReport(paramsParsed.data.id, currentUser)

        return reply.status(204).send()
      } catch (error) {
        return handleReportError(error, reply)
      }
    },
  )
}