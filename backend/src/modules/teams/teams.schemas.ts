import { z } from 'zod'

export const teamParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const teamMemberParamsSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  })
  .strict()

export const createTeamSchema = z
  .object({
    name: z.string().min(1),
    companyName: z.string().min(1).optional().nullable(),
    description: z.string().min(1).optional().nullable(),
  })
  .strict()

export const updateTeamSchema = createTeamSchema.partial().strict()

export const addTeamMemberSchema = z
  .object({
    userId: z.string().uuid(),
    roleInTeam: z.string().min(1).optional().nullable(),
  })
  .strict()

export type TeamParamsInput = z.infer<typeof teamParamsSchema>
export type TeamMemberParamsInput = z.infer<typeof teamMemberParamsSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>