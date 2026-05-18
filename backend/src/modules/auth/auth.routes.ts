import { FastifyInstance } from 'fastify'
import { authService } from './auth.service'
import { loginSchema, registerSchema } from './auth.schemas'
import {
  AuthUserNotFoundError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from './auth.errors'
import { authMiddleware, getAuthUserId } from '../../middlewares/auth.middleware'

export async function authRoutes(app: FastifyInstance) {
  // =========================================================
  // Auth
  // =========================================================

  // Регистрация пользователя
  app.post('/auth/register', async (request, reply) => {
    const bodyParsed = registerSchema.safeParse(request.body)

    if (!bodyParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: bodyParsed.error.flatten(),
      })
    }

    try {
      const user = await authService.register(bodyParsed.data)

      const token = app.jwt.sign(
        {
          sub: user.id,
          role: user.role,
          email: user.email,
        },
        {
          expiresIn: '7d',
        },
      )

      return reply.status(201).send({
        user,
        token,
      })
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        return reply.status(409).send({
          message: error.message,
        })
      }

      throw error
    }
  })

  // Вход пользователя
  app.post('/auth/login', async (request, reply) => {
    const bodyParsed = loginSchema.safeParse(request.body)

    if (!bodyParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: bodyParsed.error.flatten(),
      })
    }

    try {
      const user = await authService.login(bodyParsed.data)

      const token = app.jwt.sign(
        {
          sub: user.id,
          role: user.role,
          email: user.email,
        },
        {
          expiresIn: '7d',
        },
      )

      return reply.status(200).send({
        user,
        token,
      })
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return reply.status(401).send({
          message: error.message,
        })
      }

      throw error
    }
  })

  // Получить текущего пользователя по JWT
  app.get(
    '/auth/me',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const userId = getAuthUserId(request)

      if (!userId) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      try {
        const user = await authService.getCurrentUser(userId)

        return reply.status(200).send(user)
      } catch (error) {
        if (error instanceof AuthUserNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          })
        }

        throw error
      }
    },
  )
}