import { ItemType } from '@prisma/client'
import { z } from 'zod'

export const itemParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const sessionParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

export const sessionItemParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
    itemId: z.string().uuid(),
  })
  .strict()

export const participantParamsSchema = z
  .object({
    participantId: z.string().uuid(),
  })
  .strict()

export const participantItemParamsSchema = z
  .object({
    itemId: z.string().uuid(),
  })
  .strict()

export const createCatalogItemSchema = z
  .object({
    name: z.string().min(1, 'Item name is required'),
    type: z.nativeEnum(ItemType).default(ItemType.OTHER),
    description: z.string().nullable().optional(),
    attributeEffects: z.array(z.unknown()).nullable().optional(),
    isPublic: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .strict()

export const updateCatalogItemSchema = z
  .object({
    name: z.string().min(1, 'Item name is required').optional(),
    type: z.nativeEnum(ItemType).optional(),
    description: z.string().nullable().optional(),
    attributeEffects: z.array(z.unknown()).nullable().optional(),
    isPublic: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

export const allowSessionItemSchema = z
  .object({
    itemId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    isVisible: z.boolean().default(true),
    notes: z.string().nullable().optional(),
  })
  .strict()

export const updateSessionAllowedItemSchema = z
  .object({
    quantity: z.number().int().min(1).optional(),
    isVisible: z.boolean().optional(),
    notes: z.string().nullable().optional(),
  })
  .strict()

export const grantParticipantItemSchema = z
  .object({
    itemId: z.string().uuid().nullable().optional(),
    nameSnapshot: z.string().min(1).optional(),
    quantity: z.number().int().min(1).default(1),
    notes: z.string().nullable().optional(),
  })
  .strict()
  .refine((data) => Boolean(data.itemId || data.nameSnapshot), {
    message: 'itemId or nameSnapshot is required',
    path: ['nameSnapshot'],
  })

export const updateParticipantItemSchema = z
  .object({
    nameSnapshot: z.string().min(1).optional(),
    quantity: z.number().int().min(1).optional(),
    notes: z.string().nullable().optional(),
    isUsed: z.boolean().optional(),
  })
  .strict()

export type ItemParamsInput = z.infer<typeof itemParamsSchema>
export type SessionParamsInput = z.infer<typeof sessionParamsSchema>
export type SessionItemParamsInput = z.infer<typeof sessionItemParamsSchema>
export type ParticipantParamsInput = z.infer<typeof participantParamsSchema>
export type ParticipantItemParamsInput = z.infer<
  typeof participantItemParamsSchema
>

export type CreateCatalogItemInput = z.infer<typeof createCatalogItemSchema>
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>

export type AllowSessionItemInput = z.infer<typeof allowSessionItemSchema>
export type UpdateSessionAllowedItemInput = z.infer<
  typeof updateSessionAllowedItemSchema
>

export type GrantParticipantItemInput = z.infer<
  typeof grantParticipantItemSchema
>
export type UpdateParticipantItemInput = z.infer<
  typeof updateParticipantItemSchema
>