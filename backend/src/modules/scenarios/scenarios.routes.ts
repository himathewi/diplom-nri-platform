import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import type { CurrentUser } from '../../shared/types'
import {
  ScenarioDirectionNotFoundError,
  ScenarioForbiddenError,
  ScenarioHasActiveSessionsError,
  ScenarioNotFoundError,
  ScenarioTaskItemNotFoundError,
  ScenarioTaskNotFoundError,
  ScenarioTaskTemplateNotFoundError,
} from './scenarios.errors'
import {
  createScenarioSchema,
  createScenarioTaskSchema,
  scenarioParamsSchema,
  scenarioTaskParamsSchema,
  updateScenarioSchema,
} from './scenarios.schemas'
import { scenariosService } from './scenarios.service'

function getCurrentUserOrUnauthorized(
  request: FastifyRequest,
): CurrentUser | null {
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

function sendScenarioError(error: unknown, reply: FastifyReply) {
  if (error instanceof ScenarioNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (
    error instanceof ScenarioTaskNotFoundError ||
    error instanceof ScenarioTaskTemplateNotFoundError ||
    error instanceof ScenarioTaskItemNotFoundError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof ScenarioDirectionNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof ScenarioForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (error instanceof ScenarioHasActiveSessionsError) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  throw error
}

export async function scenariosRoutes(app: FastifyInstance) {
  app.get(
    '/scenarios',
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

      const scenarios = await scenariosService.getScenarios(currentUser)

      return reply.status(200).send(scenarios)
    },
  )

  app.get(
    '/scenarios/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = scenarioParamsSchema.safeParse(request.params)

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
        const scenario = await scenariosService.getScenarioById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(scenario)
      } catch (error) {
        return sendScenarioError(error, reply)
      }
    },
  )

  app.post(
    '/scenarios',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const bodyParsed = createScenarioSchema.safeParse(request.body)

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
        const scenario = await scenariosService.createScenario(
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(scenario)
      } catch (error) {
        return sendScenarioError(error, reply)
      }
    },
  )

  app.patch(
    '/scenarios/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = scenarioParamsSchema.safeParse(request.params)
      const bodyParsed = updateScenarioSchema.safeParse(request.body)

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
        const scenario = await scenariosService.updateScenario(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(scenario)
      } catch (error) {
        return sendScenarioError(error, reply)
      }
    },
  )

  app.delete(
    '/scenarios/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = scenarioParamsSchema.safeParse(request.params)

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
        await scenariosService.deleteScenario(paramsParsed.data.id, currentUser)

        return reply.status(204).send()
      } catch (error) {
        return sendScenarioError(error, reply)
      }
    },
  )

  app.post(
    '/scenarios/:id/copy',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = scenarioParamsSchema.safeParse(request.params)

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
        const scenario = await scenariosService.copyScenario(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(201).send(scenario)
      } catch (error) {
        return sendScenarioError(error, reply)
      }
    },
  )

  app.post(
    '/scenarios/:id/tasks',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = scenarioParamsSchema.safeParse(request.params)
      const bodyParsed = createScenarioTaskSchema.safeParse(request.body)

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
        const task = await scenariosService.addTask(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(task)
      } catch (error) {
        return sendScenarioError(error, reply)
      }
    },
  )

  app.delete(
    '/scenarios/:id/tasks/:taskId',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = scenarioTaskParamsSchema.safeParse(request.params)

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
        await scenariosService.deleteTask(
          paramsParsed.data.id,
          paramsParsed.data.taskId,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return sendScenarioError(error, reply)
      }
    },
  )
}
