import { z } from 'zod'

export const userRoleSchema = z.enum([
  'ADMIN',
  'MODERATOR',
  'PARTICIPANT',
])

export const manageableUserRoleSchema = z.enum([
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
    email: z.string().trim().email().toLowerCase().optional(),
    name: z.string().trim().min(1).optional(),
    role: manageableUserRoleSchema.optional(),
  })
  .strict()

export type UserParamsInput = z.infer<typeof userParamsSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserRoleInput = z.infer<typeof userRoleSchema>
export type ManageableUserRoleInput = z.infer<typeof manageableUserRoleSchema>