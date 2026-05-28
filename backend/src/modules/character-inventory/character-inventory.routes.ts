import { FastifyInstance } from 'fastify'
import { characterParamsSchema } from '../characters/character.schemas'
import {
  createItemSchema,
  itemParamsSchema,
  updateItemSchema,
} from './character-inventory.schemas'
import { characterInventoryService } from './character-inventory.service'
import {
  CharacterNotFoundError,
  InvalidItemQuantityError,
  ItemNotFoundError,
  ItemOwnershipError,
  ItemTemplateNotFoundError,
} from '../characters/errors'
import { ValidationError } from '../../shared/errors'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { characterAccessPreHandler } from '../characters/character-access.prehandler'

export async function characterInventoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware)
  app.addHook('preHandler', characterAccessPreHandler)

  app.get('/items', async () => {
    return characterInventoryService.getItemTemplates()
  })

  app.post('/characters/:id/items', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = createItemSchema.safeParse(request.body)

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

    try {
      const item = await characterInventoryService.addItem(
        paramsParsed.data.id,
        bodyParsed.data,
      )

      return reply.status(201).send(item)
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ItemTemplateNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof InvalidItemQuantityError) {
        return reply.status(400).send({ message: error.message })
      }

      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      throw error
    }
  })

  app.patch('/characters/:id/items/:itemId', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)
    const bodyParsed = updateItemSchema.safeParse(request.body)

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

    try {
      return await characterInventoryService.updateItem(
        paramsParsed.data.id,
        paramsParsed.data.itemId,
        bodyParsed.data,
      )
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ItemOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      if (error instanceof InvalidItemQuantityError) {
        return reply.status(400).send({ message: error.message })
      }

      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      throw error
    }
  })

  app.delete('/characters/:id/items/:itemId', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      await characterInventoryService.deleteItem(
        paramsParsed.data.id,
        paramsParsed.data.itemId,
      )

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ItemOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })
}
