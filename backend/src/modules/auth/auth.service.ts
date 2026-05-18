import * as bcrypt from 'bcryptjs'
import { authRepository } from './auth.repository'
import type { LoginInput, RegisterInput } from './auth.schemas'
import {
  AuthUserNotFoundError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from './auth.errors'

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await authRepository.findByEmail(data.email)

    if (existingUser) {
      throw new EmailAlreadyExistsError(data.email)
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    return authRepository.createUser({
      ...data,
      password: passwordHash,
    })
  },

  async login(data: LoginInput) {
    const user = await authRepository.findByEmail(data.email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password)

    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findById(userId)

    if (!user) {
      throw new AuthUserNotFoundError(userId)
    }

    return user
  },
}