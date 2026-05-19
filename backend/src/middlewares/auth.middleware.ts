import type { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma'
import type { CurrentUser, UserRole } from '../shared/types'

const VALID_ROLES: UserRole[] = ['ADMIN', 'MODERATOR', 'PARTICIPANT', 'EXPERT']

type JwtUserPayload = {
  sub?: unknown
}

type AuthenticatedUserPayload = {
  sub: string
  role: UserRole
}

function isUserRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole)
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return reply.status(401).send({
      message: 'Unauthorized',
      code: 'NO_AUTH_HEADER',
    })
  }

  if (!authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      message: 'Unauthorized',
      code: 'INVALID_TOKEN_FORMAT',
    })
  }

  try {
    await request.jwtVerify()
  } catch (error) {
    const err = error as { code?: string; message?: string }

    let code = 'JWT_VERIFICATION_FAILED'
    if (err.code === 'FST_JWT_AUTHORIZATION_TIMEEXPIRED') {
      code = 'TOKEN_EXPIRED'
    } else if (err.code === 'FST_JWT_AUTHORIZATION_INVALID') {
      code = 'INVALID_TOKEN_SIGNATURE'
    }

    request.log.warn({ code, error: err.message }, 'JWT verification failed')

    return reply.status(401).send({
      message: 'Unauthorized',
      code,
    })
  }

  const tokenUser = request.user as JwtUserPayload | undefined

  if (!tokenUser || typeof tokenUser.sub !== 'string' || !tokenUser.sub) {
    return reply.status(401).send({
      message: 'Unauthorized',
      code: 'INVALID_TOKEN_PAYLOAD',
    })
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: tokenUser.sub },
      select: {
        id: true,
        role: true,
      },
    })

    if (!dbUser) {
      return reply.status(401).send({
        message: 'Unauthorized',
        code: 'AUTH_USER_NOT_FOUND',
      })
    }

    if (!isUserRole(dbUser.role)) {
      return reply.status(401).send({
        message: 'Unauthorized',
        code: 'INVALID_USER_ROLE',
      })
    }

    request.user = {
      sub: dbUser.id,
      role: dbUser.role,
    } satisfies AuthenticatedUserPayload
  } catch (error) {
    request.log.error({ error }, 'Failed to load authenticated user')

    return reply.status(500).send({
      message: 'Internal server error',
      code: 'AUTH_USER_LOOKUP_FAILED',
    })
  }
}

export function getAuthUserId(request: FastifyRequest): string {
  const user = request.user as { sub: string } | undefined
  return user?.sub ?? ''
}

export function getAuthUserRole(request: FastifyRequest): string {
  const user = request.user as { role: string } | undefined
  return user?.role ?? ''
}

export function getCurrentUser(request: FastifyRequest): CurrentUser | null {
  const user = request.user as AuthenticatedUserPayload | undefined

  if (!user) {
    return null
  }

  return {
    id: user.sub,
    role: user.role,
  }
}
