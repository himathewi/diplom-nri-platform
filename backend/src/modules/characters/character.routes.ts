import { FastifyInstance } from 'fastify'
import {
  characterParamsSchema,
  createCharacterSchema,
  updateCharacterSchema,
} from './character.schemas'
import { characterService } from './character.service'
import { CharacterForbiddenError, CharacterNotFoundError } from './errors'
import {
  authMiddleware,
  getCurrentUser,
} from '../../middlewares/auth.middleware'

export async function characterRoutes(app: FastifyInstance) {
  app.get('/characters', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const currentUser = getCurrentUser(request)

    if (!currentUser) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    return characterService.getCharacters(currentUser)
  })

  app.get('/characters/:id', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    const currentUser = getCurrentUser(request)

    if (!currentUser) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    try {
      return await characterService.getCharacterById(
        paramsParsed.data.id,
        currentUser,
      )
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof CharacterForbiddenError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })

  app.post('/characters', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const bodyParsed = createCharacterSchema.safeParse(request.body)

    if (!bodyParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: bodyParsed.error.flatten(),
      })
    }

    const currentUser = getCurrentUser(request)

    if (!currentUser) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const character = await characterService.createCharacter(
      bodyParsed.data,
      currentUser,
    )

    return reply.status(201).send(character)
  })

  app.patch('/characters/:id', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = updateCharacterSchema.safeParse(request.body)

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
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    try {
      return await characterService.updateCharacter(
        paramsParsed.data.id,
        bodyParsed.data,
        currentUser,
      )
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof CharacterForbiddenError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })

  app.delete('/characters/:id', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    const currentUser = getCurrentUser(request)

    if (!currentUser) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    try {
      await characterService.deleteCharacter(paramsParsed.data.id, currentUser)

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof CharacterForbiddenError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })
}
