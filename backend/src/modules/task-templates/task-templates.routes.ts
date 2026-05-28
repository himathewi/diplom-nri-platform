import type { FastifyInstance, FastifyReply } from 'fastify'

import {
  authMiddleware,
  getCurrentUser,
} from '../../middlewares/auth.middleware'

import {
  addTaskTemplateRequiredItemSchema,
  addTaskTemplateSkillAdvantageSchema,
  createTaskTemplateSchema,
  taskTemplateParamsSchema,
  taskTemplateRequiredItemParamsSchema,
  taskTemplateSkillAdvantageParamsSchema,
  updateTaskTemplateSchema,
} from './task-templates.schemas'

import {
  TaskTemplateDirectionNotFoundError,
  TaskTemplateForbiddenError,
  TaskTemplateItemNotFoundError,
  TaskTemplateNotFoundError,
  TaskTemplateRequiredItemNotFoundError,
  TaskTemplateSkillAdvantageNotFoundError,
  TaskTemplateSkillNotFoundError,
} from './task-templates.errors'

import { taskTemplatesService } from './task-templates.service'

function handleTaskTemplateError(error: unknown, reply: FastifyReply) {
  if (
    error instanceof TaskTemplateNotFoundError
    || error instanceof TaskTemplateDirectionNotFoundError
    || error instanceof TaskTemplateItemNotFoundError
    || error instanceof TaskTemplateRequiredItemNotFoundError
    || error instanceof TaskTemplateSkillNotFoundError
    || error instanceof TaskTemplateSkillAdvantageNotFoundError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof TaskTemplateForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  throw error
}

export async function taskTemplatesRoutes(app: FastifyInstance) {
  app.get(
    '/task-templates',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const currentUser = getCurrentUser(request)

      if (!currentUser) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const taskTemplates = await taskTemplatesService.getTaskTemplates(
          currentUser,
        )

        return reply.status(200).send(taskTemplates)
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )

  app.get(
    '/task-templates/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = taskTemplateParamsSchema.safeParse(request.params)

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
        const taskTemplate = await taskTemplatesService.getTaskTemplateById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(taskTemplate)
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )

  app.post(
    '/task-templates',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const bodyParsed = createTaskTemplateSchema.safeParse(request.body)

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
        const taskTemplate = await taskTemplatesService.createTaskTemplate(
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(taskTemplate)
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )

  app.patch(
    '/task-templates/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = taskTemplateParamsSchema.safeParse(request.params)
      const bodyParsed = updateTaskTemplateSchema.safeParse(request.body)

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
        const taskTemplate = await taskTemplatesService.updateTaskTemplate(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(taskTemplate)
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )

  app.delete(
    '/task-templates/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = taskTemplateParamsSchema.safeParse(request.params)

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
        await taskTemplatesService.deleteTaskTemplate(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )

  app.post(
    '/task-templates/:id/items',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = taskTemplateParamsSchema.safeParse(request.params)
      const bodyParsed = addTaskTemplateRequiredItemSchema.safeParse(
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
        const requiredItem = await taskTemplatesService.addRequiredItem(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(requiredItem)
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )

  app.delete(
    '/task-templates/:id/items/:itemId',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = taskTemplateRequiredItemParamsSchema.safeParse(
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
        await taskTemplatesService.deleteRequiredItem(
          paramsParsed.data.id,
          paramsParsed.data.itemId,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )

  app.post(
    '/task-templates/:id/skill-advantages',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = taskTemplateParamsSchema.safeParse(request.params)
      const bodyParsed = addTaskTemplateSkillAdvantageSchema.safeParse(
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
        const advantage = await taskTemplatesService.addSkillAdvantage(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(advantage)
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )

  app.delete(
    '/task-templates/:id/skill-advantages/:roleSkillId',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = taskTemplateSkillAdvantageParamsSchema.safeParse(
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
        await taskTemplatesService.deleteSkillAdvantage(
          paramsParsed.data.id,
          paramsParsed.data.roleSkillId,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleTaskTemplateError(error, reply)
      }
    },
  )
}
