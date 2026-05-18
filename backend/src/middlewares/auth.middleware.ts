import type { FastifyReply, FastifyRequest } from 'fastify'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({
      message: 'Unauthorized',
    })
  }
}

export function getAuthUserId(request: FastifyRequest): string | null {
  const user = request.user as { sub?: string } | undefined

  return user?.sub ?? null
}

export function getAuthUserRole(request: FastifyRequest): string | null {
  const user = request.user as { role?: string } | undefined

  return user?.role ?? null
}