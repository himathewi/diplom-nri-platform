import type { FastifyReply, FastifyRequest } from 'fastify'
import { getCurrentUser } from '../../middlewares/auth.middleware'
import { CharacterForbiddenError, CharacterNotFoundError } from './errors'
import { characterService } from './character.service'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function characterAccessPreHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { id?: unknown } | undefined
  const characterId = params?.id

  if (typeof characterId !== 'string' || !uuidPattern.test(characterId)) {
    return
  }

  const currentUser = getCurrentUser(request)

  if (!currentUser) {
    return reply.status(401).send({
      message: 'Unauthorized',
    })
  }

  try {
    await characterService.assertCanAccessCharacter(characterId, currentUser)
  } catch (error) {
    if (error instanceof CharacterNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      })
    }

    if (error instanceof CharacterForbiddenError) {
      return reply.status(403).send({
        message: error.message,
      })
    }

    throw error
  }
}
