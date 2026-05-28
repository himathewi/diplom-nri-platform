import { SkillBenefitType, TaskType } from '@prisma/client'
import { z } from 'zod'

const nullableStringSchema = z.string().nullable().optional()

export const taskTemplateParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const taskTemplateRequiredItemParamsSchema = z
  .object({
    id: z.string().uuid(),
    itemId: z.string().uuid(),
  })
  .strict()

export const taskTemplateSkillAdvantageParamsSchema = z
  .object({
    id: z.string().uuid(),
    roleSkillId: z.string().uuid(),
  })
  .strict()

export const taskSkillAdvantageSchema = z
  .object({
    roleSkillId: z.string().uuid(),
    benefitType: z.nativeEnum(SkillBenefitType).default(SkillBenefitType.ADVANTAGE),
    fatigueCostReduction: z.number().int().min(0).max(10).default(0),
    notes: z.string().nullable().optional(),
  })
  .strict()

export const createTaskTemplateSchema = z
  .object({
    title: z.string().trim().min(1, 'Task template title is required'),
    description: z.string().trim().min(1, 'Task template description is required'),
    taskType: z.nativeEnum(TaskType).default(TaskType.MAIN),
    directionId: z.string().uuid().nullable().optional(),
    difficulty: z.number().int().min(1).max(10).default(1),
    fatigueCost: z.number().int().min(0).max(10).default(0),
    diceDifficulty: z.number().int().min(2).max(6).nullable().optional(),
    expectedResult: nullableStringSchema,
    moderatorNotes: nullableStringSchema,
    isPublic: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .strict()

export const updateTaskTemplateSchema = z
  .object({
    title: z.string().trim().min(1, 'Task template title is required').optional(),
    description: z
      .string()
      .trim()
      .min(1, 'Task template description is required')
      .optional(),
    taskType: z.nativeEnum(TaskType).optional(),
    directionId: z.string().uuid().nullable().optional(),
    difficulty: z.number().int().min(1).max(10).optional(),
    fatigueCost: z.number().int().min(0).max(10).optional(),
    diceDifficulty: z.number().int().min(2).max(6).nullable().optional(),
    expectedResult: nullableStringSchema,
    moderatorNotes: nullableStringSchema,
    isPublic: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

export const addTaskTemplateRequiredItemSchema = z
  .object({
    itemId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    notes: z.string().nullable().optional(),
  })
  .strict()

export const addTaskTemplateSkillAdvantageSchema = taskSkillAdvantageSchema

export type TaskTemplateParamsInput = z.infer<
  typeof taskTemplateParamsSchema
>

export type TaskTemplateRequiredItemParamsInput = z.infer<
  typeof taskTemplateRequiredItemParamsSchema
>

export type TaskTemplateSkillAdvantageParamsInput = z.infer<
  typeof taskTemplateSkillAdvantageParamsSchema
>

export type CreateTaskTemplateInput = z.infer<
  typeof createTaskTemplateSchema
>

export type UpdateTaskTemplateInput = z.infer<
  typeof updateTaskTemplateSchema
>

export type AddTaskTemplateRequiredItemInput = z.infer<
  typeof addTaskTemplateRequiredItemSchema
>

export type AddTaskTemplateSkillAdvantageInput = z.infer<
  typeof addTaskTemplateSkillAdvantageSchema
>
