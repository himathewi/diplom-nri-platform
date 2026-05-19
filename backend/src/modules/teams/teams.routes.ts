import type { FastifyInstance } from 'fastify'
import {
  authMiddleware,
  getAuthUserId,
  getAuthUserRole,
} from '../../middlewares/auth.middleware'
import type { CurrentUser } from '../../shared/types'
import { UserNotFoundError } from '../users/users.errors'
import { teamsService } from './teams.service'
import {
  addTeamMemberSchema,
  createTeamSchema,
  teamMemberParamsSchema,
  teamParamsSchema,
  updateTeamSchema,
} from './teams.schemas'
import {
  TeamForbiddenError,
  TeamMemberAlreadyExistsError,
  TeamMemberNotFoundError,
  TeamNotFoundError,
} from './teams.errors'

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

export async function teamsRoutes(app: FastifyInstance) {
  app.get(
    '/teams',
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

      const teams = await teamsService.getTeams(currentUser)

      return reply.status(200).send(teams)
    },
  )

  app.get(
    '/teams/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamParamsSchema.safeParse(request.params)

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
        const team = await teamsService.getTeamById(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(200).send(team)
      } catch (error) {
        if (error instanceof TeamNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof TeamForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.post(
    '/teams',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const bodyParsed = createTeamSchema.safeParse(request.body)

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
        const team = await teamsService.createTeam(bodyParsed.data, currentUser)

        return reply.status(201).send(team)
      } catch (error) {
        if (error instanceof TeamForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.patch(
    '/teams/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamParamsSchema.safeParse(request.params)
      const bodyParsed = updateTeamSchema.safeParse(request.body)

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
        const team = await teamsService.updateTeam(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(200).send(team)
      } catch (error) {
        if (error instanceof TeamNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof TeamForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.delete(
    '/teams/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamParamsSchema.safeParse(request.params)

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
        await teamsService.deleteTeam(paramsParsed.data.id, currentUser)

        return reply.status(204).send()
      } catch (error) {
        if (error instanceof TeamNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof TeamForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.post(
    '/teams/:id/members',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamParamsSchema.safeParse(request.params)
      const bodyParsed = addTeamMemberSchema.safeParse(request.body)

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
        const member = await teamsService.addMember(
          paramsParsed.data.id,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(member)
      } catch (error) {
        if (error instanceof TeamNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof UserNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof TeamForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        if (error instanceof TeamMemberAlreadyExistsError) {
          return reply.status(409).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )

  app.delete(
    '/teams/:id/members/:userId',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = teamMemberParamsSchema.safeParse(request.params)

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
        await teamsService.removeMember(
          paramsParsed.data.id,
          paramsParsed.data.userId,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        if (error instanceof TeamNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof TeamMemberNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        if (error instanceof TeamForbiddenError) {
          return reply.status(403).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )
}