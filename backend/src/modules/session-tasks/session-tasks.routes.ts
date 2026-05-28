import type { FastifyInstance, FastifyReply } from 'fastify'

import {
  authMiddleware,
  getCurrentUser,
} from '../../middlewares/auth.middleware'

import {
  addSessionTaskRequiredItemSchema,
  createSessionTaskSchema,
  sessionTaskParamsSchema,
  sessionTaskRequiredItemParamsSchema,
  sessionTaskSessionParamsSchema,
  updateSessionTaskSchema,
} from './session-tasks.schemas'

import {
  SessionTaskForbiddenError,
  SessionTaskItemNotFoundError,
  SessionTaskNotFoundError,
  SessionTaskRequiredItemNotFoundError,
  SessionTaskScenarioMismatchError,
  SessionTaskScenarioTaskNotFoundError,
  SessionTaskSessionFinishedError,
  SessionTaskSessionNotFoundError,
  SessionTaskSourceConflictError,
  SessionTaskTemplateNotFoundError,
  SessionTaskTitleRequiredError,
} from './session-tasks.errors'

import { sessionTasksService } from './session-tasks.service'

function handleSessionTaskError(error: unknown, reply: FastifyReply) {
  if (
    error instanceof SessionTaskNotFoundError
    || error instanceof SessionTaskSessionNotFoundError
    || error instanceof SessionTaskTemplateNotFoundError
    || error instanceof SessionTaskScenarioTaskNotFoundError
    || error instanceof SessionTaskItemNotFoundError
    || error instanceof SessionTaskRequiredItemNotFoundError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof SessionTaskForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (
    error instanceof SessionTaskSessionFinishedError
    || error instanceof SessionTaskScenarioMismatchError
    || error instanceof SessionTaskSourceConflictError
    || error instanceof SessionTaskTitleRequiredError
  ) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  throw error
}

export async function sessionTasksRoutes(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId/tasks',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionTaskSessionParamsSchema.safeParse(
        request.params,
      )

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUser(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const tasks = await sessionTasksService.getSessionTasks(
          paramsParsed.data.sessionId,
          currentUser,
        )

        return reply.status(200).send(tasks)
      } catch (error) {
        return handleSessionTaskError(error, reply)
      }
    },
  )

  app.get(
    '/session-tasks/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionTaskParamsSchema.safeParse(request.params)

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUser(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const task = await sessionTasksService.getSessionTaskById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(task)
      } catch (error) {
        return handleSessionTaskError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:sessionId/tasks',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionTaskSessionParamsSchema.safeParse(
        request.params,
      )
      const bodyParsed = createSessionTaskSchema.safeParse(request.body)

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

      const currentUser = getCurrentUser(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const task = await sessionTasksService.createSessionTask(
          paramsParsed.data.sessionId,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(task)
      } catch (error) {
        return handleSessionTaskError(error, reply)
      }
    },
  )

  app.patch(
    '/session-tasks/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionTaskParamsSchema.safeParse(request.params)
      const bodyParsed = updateSessionTaskSchema.safeParse(request.body)

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

      const currentUser = getCurrentUser(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const task = await sessionTasksService.updateSessionTask(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(task)
      } catch (error) {
        return handleSessionTaskError(error, reply)
      }
    },
  )

  app.delete(
    '/session-tasks/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionTaskParamsSchema.safeParse(request.params)

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUser(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        await sessionTasksService.deleteSessionTask(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleSessionTaskError(error, reply)
      }
    },
  )

  app.post(
    '/session-tasks/:id/items',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionTaskParamsSchema.safeParse(request.params)
      const bodyParsed = addSessionTaskRequiredItemSchema.safeParse(
        request.body,
      )

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

      const currentUser = getCurrentUser(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const requiredItem = await sessionTasksService.addRequiredItem(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(requiredItem)
      } catch (error) {
        return handleSessionTaskError(error, reply)
      }
    },
  )

  app.delete(
    '/session-tasks/:id/items/:itemId',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionTaskRequiredItemParamsSchema.safeParse(
        request.params,
      )

      if (!paramsParsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: paramsParsed.error.flatten(),
        })
      }

      const currentUser = getCurrentUser(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        await sessionTasksService.deleteRequiredItem(
          paramsParsed.data.id,
          paramsParsed.data.itemId,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleSessionTaskError(error, reply)
      }
    },
  )
}