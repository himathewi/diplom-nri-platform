import type { FastifyInstance } from 'fastify'

import { authMiddleware } from '../../middlewares/auth.middleware'
import type { CurrentUser } from '../../shared/types'

import {
  allowSessionItemSchema,
  createCatalogItemSchema,
  itemParamsSchema,
  participantItemParamsSchema,
  participantParamsSchema,
  sessionItemParamsSchema,
  sessionParamsSchema,
  updateCatalogItemSchema,
  updateParticipantItemSchema,
  updateSessionAllowedItemSchema,
  grantParticipantItemSchema,
} from './items.schemas'

import { itemsService } from './items.service'

import {
  CustomParticipantItemNameRequiredError,
  InvalidItemQuantityError,
  InvalidSessionStatusForItemsError,
  ItemNotAllowedForSessionError,
  ItemNotFoundError,
  ParticipantItemForbiddenError,
  ParticipantItemNotFoundError,
  SessionAllowedItemAlreadyExistsError,
  SessionAllowedItemNotFoundError,
  SessionForbiddenError,
  SessionNotFoundError,
  SessionParticipantNotFoundError,
} from './items.errors'

function getCurrentUser(request: { user: unknown }) {
  return request.user as CurrentUser
}

function sendValidationError(reply: any, error: unknown) {
  return reply.status(400).send({
    message: 'Validation error',
    errors: error,
  })
}

function handleItemsError(error: unknown, reply: any) {
  if (
    error instanceof ItemNotFoundError
    || error instanceof SessionNotFoundError
    || error instanceof SessionAllowedItemNotFoundError
    || error instanceof SessionParticipantNotFoundError
    || error instanceof ParticipantItemNotFoundError
  ) {
    return reply.status(404).send({ message: error.message })
  }

  if (
    error instanceof SessionForbiddenError
    || error instanceof ParticipantItemForbiddenError
  ) {
    return reply.status(403).send({ message: error.message })
  }

  if (
    error instanceof InvalidItemQuantityError
    || error instanceof CustomParticipantItemNameRequiredError
    || error instanceof ItemNotAllowedForSessionError
    || error instanceof SessionAllowedItemAlreadyExistsError
  ) {
    return reply.status(400).send({ message: error.message })
  }

  if (error instanceof InvalidSessionStatusForItemsError) {
    return reply.status(409).send({ message: error.message })
  }

  throw error
}

export async function itemsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware)

  app.get('/items', async (request) => {
    return itemsService.getCatalogItems(getCurrentUser(request))
  })

  app.get('/items/:id', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    try {
      return await itemsService.getCatalogItemById(
        paramsParsed.data.id,
        getCurrentUser(request),
      )
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.post('/items', async (request, reply) => {
    const bodyParsed = createCatalogItemSchema.safeParse(request.body)

    if (!bodyParsed.success) {
      return sendValidationError(reply, bodyParsed.error.flatten())
    }

    try {
      const item = await itemsService.createCatalogItem(
        bodyParsed.data,
        getCurrentUser(request),
      )

      return reply.status(201).send(item)
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.patch('/items/:id', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)
    const bodyParsed = updateCatalogItemSchema.safeParse(request.body)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    if (!bodyParsed.success) {
      return sendValidationError(reply, bodyParsed.error.flatten())
    }

    try {
      return await itemsService.updateCatalogItem(
        paramsParsed.data.id,
        bodyParsed.data,
        getCurrentUser(request),
      )
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.delete('/items/:id', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    try {
      await itemsService.deleteCatalogItem(
        paramsParsed.data.id,
        getCurrentUser(request),
      )

      return reply.status(204).send()
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.get('/sessions/:sessionId/items', async (request, reply) => {
    const paramsParsed = sessionParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    try {
      return await itemsService.getSessionItems(
        paramsParsed.data.sessionId,
        getCurrentUser(request),
      )
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.post('/sessions/:sessionId/items', async (request, reply) => {
    const paramsParsed = sessionParamsSchema.safeParse(request.params)
    const bodyParsed = allowSessionItemSchema.safeParse(request.body)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    if (!bodyParsed.success) {
      return sendValidationError(reply, bodyParsed.error.flatten())
    }

    try {
      const allowedItem = await itemsService.allowItemForSession(
        paramsParsed.data.sessionId,
        bodyParsed.data,
        getCurrentUser(request),
      )

      return reply.status(201).send(allowedItem)
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.patch('/sessions/:sessionId/items/:itemId', async (request, reply) => {
    const paramsParsed = sessionItemParamsSchema.safeParse(request.params)
    const bodyParsed = updateSessionAllowedItemSchema.safeParse(request.body)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    if (!bodyParsed.success) {
      return sendValidationError(reply, bodyParsed.error.flatten())
    }

    try {
      return await itemsService.updateSessionAllowedItem(
        paramsParsed.data.sessionId,
        paramsParsed.data.itemId,
        bodyParsed.data,
        getCurrentUser(request),
      )
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.delete('/sessions/:sessionId/items/:itemId', async (request, reply) => {
    const paramsParsed = sessionItemParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    try {
      await itemsService.removeSessionAllowedItem(
        paramsParsed.data.sessionId,
        paramsParsed.data.itemId,
        getCurrentUser(request),
      )

      return reply.status(204).send()
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.get('/session-participants/:participantId/items', async (
    request,
    reply,
  ) => {
    const paramsParsed = participantParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    try {
      return await itemsService.getParticipantItems(
        paramsParsed.data.participantId,
        getCurrentUser(request),
      )
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.post('/session-participants/:participantId/items', async (
    request,
    reply,
  ) => {
    const paramsParsed = participantParamsSchema.safeParse(request.params)
    const bodyParsed = grantParticipantItemSchema.safeParse(request.body)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    if (!bodyParsed.success) {
      return sendValidationError(reply, bodyParsed.error.flatten())
    }

    try {
      const participantItem = await itemsService.grantItemToParticipant(
        paramsParsed.data.participantId,
        bodyParsed.data,
        getCurrentUser(request),
      )

      return reply.status(201).send(participantItem)
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.patch('/participant-items/:itemId', async (request, reply) => {
    const paramsParsed = participantItemParamsSchema.safeParse(request.params)
    const bodyParsed = updateParticipantItemSchema.safeParse(request.body)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    if (!bodyParsed.success) {
      return sendValidationError(reply, bodyParsed.error.flatten())
    }

    try {
      return await itemsService.updateParticipantItem(
        paramsParsed.data.itemId,
        bodyParsed.data,
        getCurrentUser(request),
      )
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })

  app.delete('/participant-items/:itemId', async (request, reply) => {
    const paramsParsed = participantItemParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return sendValidationError(reply, paramsParsed.error.flatten())
    }

    try {
      await itemsService.deleteParticipantItem(
        paramsParsed.data.itemId,
        getCurrentUser(request),
      )

      return reply.status(204).send()
    } catch (error) {
      return handleItemsError(error, reply)
    }
  })
}