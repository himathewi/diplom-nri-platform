import { z } from 'zod'

export const equipmentSlotSchema = z.enum([
  'mainHand',
  'offHand',
  'head',
  'body',
  'ring1',
  'ring2',
  'amulet',
  'boots',
])

const itemTypeSchema = z.string().min(1)
const itemEffectsSchema = z.array(z.unknown())

export const itemParamsSchema = z
  .object({
    id: z.string().uuid(),
    itemId: z.string().uuid(),
  })
  .strict()

export const createItemSchema = z
  .object({
    itemTemplateId: z.string().uuid().nullable().optional(),
    nameSnapshot: z.string().min(1).optional(),
    quantity: z.number().int().min(1).default(1),
    notes: z.string().nullable().optional(),
    type: itemTypeSchema.nullable().optional(),
    allowedSlots: z.array(equipmentSlotSchema).nullable().optional(),
    effects: itemEffectsSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Boolean(data.itemTemplateId || data.nameSnapshot), {
    message: 'itemTemplateId or nameSnapshot is required',
    path: ['nameSnapshot'],
  })

export const updateItemSchema = z
  .object({
    nameSnapshot: z.string().min(1).optional(),
    quantity: z.number().int().min(1).optional(),
    notes: z.string().nullable().optional(),
    type: itemTypeSchema.nullable().optional(),
    allowedSlots: z.array(equipmentSlotSchema).nullable().optional(),
    effects: itemEffectsSchema.nullable().optional(),
  })
  .strict()

export const equipItemSchema = z
  .object({
    equippedSlot: equipmentSlotSchema.optional(),
  })
  .strict()

export const unequipItemSchema = z.object({}).strict()

export type EquipmentSlotInput = z.infer<typeof equipmentSlotSchema>
export type ItemParamsInput = z.infer<typeof itemParamsSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type EquipItemInput = z.infer<typeof equipItemSchema>
export type UnequipItemInput = z.infer<typeof unequipItemSchema>
