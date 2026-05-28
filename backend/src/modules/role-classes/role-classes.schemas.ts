import { z } from 'zod'

export const roleClassParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const roleClassSkillParamsSchema = z
  .object({
    id: z.string().uuid(),
    skillId: z.string().uuid(),
  })
  .strict()

export const sessionParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

export const sessionRoleClassParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
    roleClassId: z.string().uuid(),
  })
  .strict()

export const createRoleClassSchema = z
  .object({
    name: z.string().min(1, 'Role class name is required'),
    description: z.string().nullable().optional(),
    isPublic: z.boolean().optional(),
    isActive: z.boolean().optional(),
    skills: z
      .array(
        z
          .object({
            name: z.string().trim().min(1, 'Skill name is required'),
            description: z.string().nullable().optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict()

export const updateRoleClassSchema = z
  .object({
    name: z.string().min(1, 'Role class name is required').optional(),
    description: z.string().nullable().optional(),
    isPublic: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const allowRoleClassForSessionSchema = z
  .object({
    roleClassId: z.string().uuid(),
  })
  .strict()

export const createRoleClassSkillSchema = z
  .object({
    name: z.string().trim().min(1, 'Skill name is required'),
    description: z.string().nullable().optional(),
  })
  .strict()

export const updateRoleClassSkillSchema = z
  .object({
    name: z.string().trim().min(1, 'Skill name is required').optional(),
    description: z.string().nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export type RoleClassParamsInput = z.infer<typeof roleClassParamsSchema>
export type RoleClassSkillParamsInput = z.infer<
  typeof roleClassSkillParamsSchema
>
export type SessionParamsInput = z.infer<typeof sessionParamsSchema>
export type SessionRoleClassParamsInput = z.infer<
  typeof sessionRoleClassParamsSchema
>

export type CreateRoleClassInput = z.infer<typeof createRoleClassSchema>
export type UpdateRoleClassInput = z.infer<typeof updateRoleClassSchema>
export type AllowRoleClassForSessionInput = z.infer<
  typeof allowRoleClassForSessionSchema
>
export type CreateRoleClassSkillInput = z.infer<
  typeof createRoleClassSkillSchema
>
export type UpdateRoleClassSkillInput = z.infer<
  typeof updateRoleClassSkillSchema
>
