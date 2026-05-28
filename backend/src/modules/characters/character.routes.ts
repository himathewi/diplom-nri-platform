import type { FastifyInstance } from 'fastify'

import {
  authMiddleware,
  getCurrentUser,
} from '../../middlewares/auth.middleware'

import {
  characterParamsSchema,
  createCharacterSchema,
  sessionCharacterCreationSchema,
  sessionCharacterParamsSchema,
  updateCharacterSchema,
} from './character.schemas'

import { characterService } from './character.service'

export async function characterRoutes(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId/character-options',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionCharacterParamsSchema.safeParse(
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

      return characterService.getCharacterOptions(
        paramsParsed.data.sessionId,
        currentUser,
      )
    },
  )

  app.post(
    '/sessions/:sessionId/characters',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = sessionCharacterParamsSchema.safeParse(
        request.params,
      )
      const bodyParsed = sessionCharacterCreationSchema.safeParse(request.body)

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

      const character = await characterService.createCharacterForSession(
        paramsParsed.data.sessionId,
        bodyParsed.data,
        currentUser,
      )

      return reply.status(201).send(character)
    },
  )

  app.get(
    '/characters',
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

      return characterService.getCharacters(currentUser)
    },
  )

  app.get(
    '/characters/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = characterParamsSchema.safeParse(request.params)

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

      return characterService.getCharacterById(paramsParsed.data.id, currentUser)
    },
  )

  app.post(
    '/characters',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const bodyParsed = createCharacterSchema.safeParse(request.body)

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

      const character = await characterService.createCharacter(
        bodyParsed.data,
        currentUser,
      )

      return reply.status(201).send(character)
    },
  )

  app.patch(
    '/characters/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
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
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      return characterService.updateCharacter(
        paramsParsed.data.id,
        bodyParsed.data,
        currentUser,
      )
    },
  )

  app.delete(
    '/characters/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const paramsParsed = characterParamsSchema.safeParse(request.params)

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

      await characterService.deleteCharacter(paramsParsed.data.id, currentUser)

      return reply.status(204).send()
    },
  )
}