import type { FastifyInstance } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import { scenariosService } from './scenarios.service'
import {
  createScenarioSchema,
  createScenarioTaskSchema,
  scenarioParamsSchema,
  scenarioTaskParamsSchema,
  updateScenarioSchema,
} from './scenarios.schemas'
import {
  ScenarioForbiddenError,
  ScenarioNotFoundError,
  ScenarioTaskNotFoundError,
} from './scenarios.errors'

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

export async function scenariosRoutes(app: FastifyInstance) {
  app.get(
    '/scenarios',
    {
      preHandler: authMiddleware,
    },
    async (_request, reply) => {
      const scenarios = await scenariosService.getScenarios()

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

      try {
        const scenario = await scenariosService.getScenarioById(
          paramsParsed.data.id,
        )

        return reply.status(200).send(scenario)
      } catch (error) {
        if (error instanceof ScenarioNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        throw error
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
        if (error instanceof ScenarioForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
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
        if (error instanceof ScenarioNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof ScenarioForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
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
        if (error instanceof ScenarioNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof ScenarioForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
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
        if (error instanceof ScenarioNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof ScenarioForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
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
        if (error instanceof ScenarioNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof ScenarioTaskNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof ScenarioForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )
}