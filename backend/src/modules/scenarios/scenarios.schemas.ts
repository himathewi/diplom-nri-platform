import { z } from 'zod'

export const scenarioDomainSchema = z.enum([
  'CROP_PRODUCTION',
  'GREENHOUSE',
  'LIVESTOCK',
  'LOGISTICS',
  'PROCESSING',
  'ROBOTICS',
  'TEAMBUILDING',
])

export const scenarioParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const scenarioTaskParamsSchema = z
  .object({
    id: z.string().uuid(),
    taskId: z.string().uuid(),
  })
  .strict()

export const createScenarioSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    domain: scenarioDomainSchema,
    goal: z.string().min(1),
    difficulty: z.number().int().min(1).max(5).optional(),
  })
  .strict()

export const updateScenarioSchema = createScenarioSchema.partial().strict()

export const createScenarioTaskSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    taskType: z.string().min(1),
    expectedResult: z.string().min(1).optional().nullable(),
  })
  .strict()

export type ScenarioParamsInput = z.infer<typeof scenarioParamsSchema>
export type ScenarioTaskParamsInput = z.infer<typeof scenarioTaskParamsSchema>
export type CreateScenarioInput = z.infer<typeof createScenarioSchema>
export type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>
export type CreateScenarioTaskInput = z.infer<typeof createScenarioTaskSchema>