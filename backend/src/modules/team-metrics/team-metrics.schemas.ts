import { z } from 'zod'

export const teamMetricParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const teamMetricSessionParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

const scoreSchema = z.number().int().min(0).max(100)

export const createTeamMetricSchema = z
  .object({
    communicationScore: scoreSchema.default(0),
    decisionSpeedScore: scoreSchema.default(0),
    roleDistributionScore: scoreSchema.default(0),
    conflictResolutionScore: scoreSchema.default(0),
    leadershipScore: scoreSchema.default(0),
    comment: z.string().optional().nullable(),
  })
  .strict()

export const updateTeamMetricSchema = z
  .object({
    communicationScore: scoreSchema.optional(),
    decisionSpeedScore: scoreSchema.optional(),
    roleDistributionScore: scoreSchema.optional(),
    conflictResolutionScore: scoreSchema.optional(),
    leadershipScore: scoreSchema.optional(),
    comment: z.string().optional().nullable(),
  })
  .strict()

export type TeamMetricParamsInput = z.infer<typeof teamMetricParamsSchema>
export type TeamMetricSessionParamsInput = z.infer<
  typeof teamMetricSessionParamsSchema
>
export type CreateTeamMetricInput = z.infer<typeof createTeamMetricSchema>
export type UpdateTeamMetricInput = z.infer<typeof updateTeamMetricSchema>