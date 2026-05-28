import { z } from 'zod'

export const decisionParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const decisionSessionParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

export const createDecisionSchema = z
  .object({
    sessionParticipantId: z.string().uuid().optional().nullable(),
    eventId: z.string().uuid().optional().nullable(),
    sessionTaskId: z.string().uuid().optional().nullable(),
    description: z.string().min(1),
    result: z.string().optional().nullable(),
  })
  .strict()

export const updateDecisionSchema = z
  .object({
    sessionParticipantId: z.string().uuid().optional().nullable(),
    eventId: z.string().uuid().optional().nullable(),
    sessionTaskId: z.string().uuid().optional().nullable(),
    description: z.string().min(1).optional(),
    result: z.string().optional().nullable(),
  })
  .strict()

export const evaluateDecisionSchema = z
  .object({
    result: z.string().optional().nullable(),
    moderatorComment: z.string().optional().nullable(),
    score: z.number().int().min(0).max(100).optional().nullable(),
  })
  .strict()

export type DecisionParamsInput = z.infer<typeof decisionParamsSchema>
export type DecisionSessionParamsInput = z.infer<
  typeof decisionSessionParamsSchema
>
export type CreateDecisionInput = z.infer<typeof createDecisionSchema>
export type UpdateDecisionInput = z.infer<typeof updateDecisionSchema>
export type EvaluateDecisionInput = z.infer<typeof evaluateDecisionSchema>