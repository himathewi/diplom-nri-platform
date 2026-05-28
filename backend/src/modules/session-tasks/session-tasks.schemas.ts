import { SessionTaskStatus, TaskType } from '@prisma/client'
import { z } from 'zod'

const nullableStringSchema = z.string().nullable().optional()

export const sessionTaskParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const sessionTaskSessionParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

export const sessionTaskRequiredItemParamsSchema = z
  .object({
    id: z.string().uuid(),
    itemId: z.string().uuid(),
  })
  .strict()

export const sessionTaskRequiredItemSchema = z
  .object({
    itemId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    notes: z.string().nullable().optional(),
  })
  .strict()

export const createSessionTaskSchema = z
  .object({
    scenarioTaskId: z.string().uuid().nullable().optional(),
    sourceTemplateId: z.string().uuid().nullable().optional(),

    title: z.string().trim().min(1).optional(),
    descriptionForModerator: nullableStringSchema,
    descriptionForParticipants: nullableStringSchema,

    taskType: z.nativeEnum(TaskType).optional(),
    difficulty: z.number().int().min(1).max(10).optional(),
    fatigueCost: z.number().int().min(0).max(10).optional(),
    isVisibleToParticipants: z.boolean().optional(),

    requiredItems: z.array(sessionTaskRequiredItemSchema).optional(),
  })
  .strict()

export const updateSessionTaskSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    descriptionForModerator: nullableStringSchema,
    descriptionForParticipants: nullableStringSchema,
    taskType: z.nativeEnum(TaskType).optional(),
    status: z.nativeEnum(SessionTaskStatus).optional(),
    difficulty: z.number().int().min(1).max(10).optional(),
    fatigueCost: z.number().int().min(0).max(10).optional(),
    isVisibleToParticipants: z.boolean().optional(),
    result: z.string().nullable().optional(),
  })
  .strict()

export const addSessionTaskRequiredItemSchema = sessionTaskRequiredItemSchema

export type SessionTaskParamsInput = z.infer<typeof sessionTaskParamsSchema>

export type SessionTaskSessionParamsInput = z.infer<
  typeof sessionTaskSessionParamsSchema
>

export type SessionTaskRequiredItemParamsInput = z.infer<
  typeof sessionTaskRequiredItemParamsSchema
>

export type SessionTaskRequiredItemInput = z.infer<
  typeof sessionTaskRequiredItemSchema
>

export type CreateSessionTaskInput = z.infer<typeof createSessionTaskSchema>

export type UpdateSessionTaskInput = z.infer<typeof updateSessionTaskSchema>

export type AddSessionTaskRequiredItemInput = z.infer<
  typeof addSessionTaskRequiredItemSchema
>