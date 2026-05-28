import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { authMiddleware } from '../../middlewares/auth.middleware'

import { characterAccessPreHandler } from '../characters/character-access.prehandler'
import { CharacterNotFoundError } from '../characters/errors'
import { characterParamsSchema } from '../characters/character.schemas'

import { CharacterSheetService } from './character-sheet.service'

type CharacterSheetRouteDeps = {
  characterSheetService: CharacterSheetService
}

type CharacterParams = {
  id: string
}

export async function characterSheetRoutes(
  app: FastifyInstance,
  deps: CharacterSheetRouteDeps,
) {
  const { characterSheetService } = deps

  app.addHook('preHandler', authMiddleware)
  app.addHook('preHandler', characterAccessPreHandler)

  app.get(
    '/characters/:id/sheet',
    async (
      request: FastifyRequest<{ Params: CharacterParams }>,
      reply: FastifyReply,
    ) => {
      const parsed = characterParamsSchema.safeParse(request.params)

      if (!parsed.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: parsed.error.flatten(),
        })
      }

      try {
        return await characterSheetService.getCharacterSheet(parsed.data.id)
      } catch (error: unknown) {
        if (error instanceof CharacterNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )
}