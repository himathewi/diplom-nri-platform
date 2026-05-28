import type { FastifyInstance } from 'fastify'

import { authMiddleware } from '../../middlewares/auth.middleware'

import { characterAccessPreHandler } from '../characters/character-access.prehandler'
import { characterParamsSchema } from '../characters/character.schemas'

import {
  CharacterStatsCharacterNotFoundError,
  CharacterStatsValidationError,
} from './character-stats.errors'

import {
  characterStatsSchema,
  updateCharacterStatsSchema,
} from './character-stats.schemas'

import { characterStatsService } from './character-stats.service'

function handleCharacterStatsError(error: unknown, reply: any) {
  if (error instanceof CharacterStatsCharacterNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof CharacterStatsValidationError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  throw error
}

export async function characterStatsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware)
  app.addHook('preHandler', characterAccessPreHandler)

  app.get('/characters/:id/stats', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterStatsService.getCharacterStats(paramsParsed.data.id)
    } catch (error) {
      return handleCharacterStatsError(error, reply)
    }
  })

  app.put('/characters/:id/stats', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = characterStatsSchema.safeParse(request.body)

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
      return await characterStatsService.setCharacterStats(
        paramsParsed.data.id,
        bodyParsed.data,
      )
    } catch (error) {
      return handleCharacterStatsError(error, reply)
    }
  })

  app.patch('/characters/:id/stats', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = updateCharacterStatsSchema.safeParse(request.body)

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
      return await characterStatsService.updateCharacterStats(
        paramsParsed.data.id,
        bodyParsed.data,
      )
    } catch (error) {
      return handleCharacterStatsError(error, reply)
    }
  })

  app.post('/characters/:id/stats/roll', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterStatsService.rollCharacterStats(paramsParsed.data.id)
    } catch (error) {
      return handleCharacterStatsError(error, reply)
    }
  })

  app.post('/characters/:id/stats/reset', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterStatsService.resetCharacterStats(paramsParsed.data.id)
    } catch (error) {
      return handleCharacterStatsError(error, reply)
    }
  })
}