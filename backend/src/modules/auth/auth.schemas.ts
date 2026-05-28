import { z } from 'zod'

// =========================================================
// Auth
// =========================================================

export const userRoleSchema = z.enum([
  'ADMIN',
  'MODERATOR',
  'PARTICIPANT',
])

export const registerRoleSchema = z.enum([
  'MODERATOR',
  'PARTICIPANT',
])

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: registerRoleSchema.default('PARTICIPANT'),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict()

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UserRoleInput = z.infer<typeof userRoleSchema>
export type RegisterRoleInput = z.infer<typeof registerRoleSchema>