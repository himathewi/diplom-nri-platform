import type { FastifyInstance, FastifyReply } from 'fastify'

import {
  authMiddleware,
  getCurrentUser,
} from '../../middlewares/auth.middleware'

import {
  acceptCodeInvitationSchema,
  createInvitationSchema,
  invitationParamsSchema,
  invitationTokenParamsSchema,
  sessionInvitationParamsSchema,
} from './invitations.schemas'

import { invitationsService } from './invitations.service'

import {
  InvitationAlreadyUsedError,
  InvitationCodeGenerationError,
  InvitationExpiredError,
  InvitationForbiddenError,
  InvitationInvalidSessionStatusError,
  InvitationNotFoundError,
  InvitationParticipantAlreadyExistsError,
  InvitationRevokedError,
  InvitationSessionNotFoundError,
  InvitationUserMismatchError,
} from './invitations.errors'

function handleInvitationError(error: unknown, reply: FastifyReply) {
  if (
    error instanceof InvitationNotFoundError
    || error instanceof InvitationSessionNotFoundError
  ) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (
    error instanceof InvitationForbiddenError
    || error instanceof InvitationUserMismatchError
  ) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  if (
    error instanceof InvitationExpiredError
    || error instanceof InvitationAlreadyUsedError
    || error instanceof InvitationRevokedError
    || error instanceof InvitationInvalidSessionStatusError
    || error instanceof InvitationParticipantAlreadyExistsError
    || error instanceof InvitationCodeGenerationError
  ) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  throw error
}

export async function invitationsRoutes(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId/invitations',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionInvitationParamsSchema.safeParse(
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
        const invitations = await invitationsService.getSessionInvitations(
          paramsParsed.data.sessionId,
          currentUser,
        )

        return reply.status(200).send(invitations)
      } catch (error) {
        return handleInvitationError(error, reply)
      }
    },
  )

  app.post(
    '/sessions/:sessionId/invitations',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionInvitationParamsSchema.safeParse(
        request.params,
      )
      const bodyParsed = createInvitationSchema.safeParse(request.body)

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
        const invitation = await invitationsService.createInvitation(
          paramsParsed.data.sessionId,
          bodyParsed.data,
          currentUser,
        )

        return reply.status(201).send(invitation)
      } catch (error) {
        return handleInvitationError(error, reply)
      }
    },
  )

  app.get('/invitations/link/:token', async (request, reply) => {
    const paramsParsed = invitationTokenParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      const invitation = await invitationsService.getInvitationByToken(
        paramsParsed.data.token,
      )

      return reply.status(200).send(invitation)
    } catch (error) {
      return handleInvitationError(error, reply)
    }
  })

  app.post(
    '/invitations/link/:token/accept',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = invitationTokenParamsSchema.safeParse(request.params)

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
        const result = await invitationsService.acceptInvitationByToken(
          paramsParsed.data.token,
          currentUser,
        )

        return reply.status(200).send(result)
      } catch (error) {
        return handleInvitationError(error, reply)
      }
    },
  )

  app.post(
    '/invitations/code/accept',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const bodyParsed = acceptCodeInvitationSchema.safeParse(request.body)

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
        const result = await invitationsService.acceptInvitationByCode(
          bodyParsed.data.code,
          currentUser,
        )

        return reply.status(200).send(result)
      } catch (error) {
        return handleInvitationError(error, reply)
      }
    },
  )

  app.delete(
    '/invitations/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = invitationParamsSchema.safeParse(request.params)

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
        await invitationsService.revokeInvitation(
          paramsParsed.data.id,
          currentUser,
        )

        return reply.status(204).send()
      } catch (error) {
        return handleInvitationError(error, reply)
      }
    },
  )
}