import { z } from 'zod'

export const userRoleSchema = z.enum([
  'ADMIN',
  'MODERATOR',
  'PARTICIPANT',
])

export const userParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const updateUserSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().min(1).optional(),
    role: userRoleSchema.optional(),
  })
  .strict()

export type UserParamsInput = z.infer<typeof userParamsSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserRoleInput = z.infer<typeof userRoleSchema>
