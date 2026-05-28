import { SkillBenefitType } from '@prisma/client'
import { z } from 'zod'

export const scenarioSourceTypeSchema = z.enum(['TEMPLATE', 'CUSTOM'])

export const scenarioTaskTypeSchema = z.enum(['MAIN', 'SIDE', 'OPTIONAL'])

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

export const scenarioTaskSkillAdvantageParamsSchema = z
  .object({
    id: z.string().uuid(),
    taskId: z.string().uuid(),
    roleSkillId: z.string().uuid(),
  })
  .strict()

export const scenarioTaskSkillAdvantageSchema = z
  .object({
    roleSkillId: z.string().uuid(),
    benefitType: z.nativeEnum(SkillBenefitType).default(SkillBenefitType.ADVANTAGE),
    fatigueCostReduction: z.number().int().min(0).max(10).default(0),
    notes: z.string().nullable().optional(),
  })
  .strict()

export const createScenarioSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    goal: z.string().min(1),
    difficulty: z.number().int().min(1).max(5).optional(),

    sourceType: scenarioSourceTypeSchema.optional(),
    isPublicTemplate: z.boolean().optional(),

    directionId: z.string().uuid().nullable().optional(),
  })
  .strict()

export const updateScenarioSchema = createScenarioSchema.partial().strict()

export const createScenarioTaskSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    taskType: scenarioTaskTypeSchema.optional(),
    sourceTemplateId: z.string().uuid().nullable().optional(),

    difficulty: z.number().int().min(1).max(5).optional(),
    fatigueCost: z.number().int().min(0).optional(),
    diceDifficulty: z.number().int().min(2).max(6).nullable().optional(),

    expectedResult: z.string().min(1).nullable().optional(),
    moderatorNotes: z.string().min(1).nullable().optional(),
    isVisibleByDefault: z.boolean().optional(),
    requiredItems: z
      .array(
        z
          .object({
            itemId: z.string().uuid(),
            quantity: z.number().int().min(1).default(1),
            notes: z.string().nullable().optional(),
          })
          .strict(),
      )
      .optional(),
    advantageSkills: z.array(scenarioTaskSkillAdvantageSchema).optional(),
  })
  .strict()

export const addScenarioTaskSkillAdvantageSchema =
  scenarioTaskSkillAdvantageSchema

export type ScenarioParamsInput = z.infer<typeof scenarioParamsSchema>
export type ScenarioTaskParamsInput = z.infer<typeof scenarioTaskParamsSchema>
export type ScenarioTaskSkillAdvantageParamsInput = z.infer<
  typeof scenarioTaskSkillAdvantageParamsSchema
>
export type CreateScenarioInput = z.infer<typeof createScenarioSchema>
export type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>
export type CreateScenarioTaskInput = z.infer<typeof createScenarioTaskSchema>
export type AddScenarioTaskSkillAdvantageInput = z.infer<
  typeof addScenarioTaskSkillAdvantageSchema
>
