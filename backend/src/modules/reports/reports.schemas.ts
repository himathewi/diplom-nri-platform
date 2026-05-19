import { z } from 'zod'

export const reportParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const reportSessionParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

export const createReportSchema = z
  .object({
    summary: z.string().min(1).optional(),
    successfulActions: z.string().min(1).optional().nullable(),
    problemActions: z.string().min(1).optional().nullable(),
    recommendations: z.string().min(1).optional().nullable(),
  })
  .strict()

export const updateReportSchema = z
  .object({
    summary: z.string().min(1).optional(),
    successfulActions: z.string().min(1).optional().nullable(),
    problemActions: z.string().min(1).optional().nullable(),
    recommendations: z.string().min(1).optional().nullable(),
  })
  .strict()

export type ReportParamsInput = z.infer<typeof reportParamsSchema>
export type ReportSessionParamsInput = z.infer<typeof reportSessionParamsSchema>
export type CreateReportInput = z.infer<typeof createReportSchema>
export type UpdateReportInput = z.infer<typeof updateReportSchema>