import type { Stats } from './characters'

export type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'body'
  | 'ring1'
  | 'ring2'
  | 'amulet'
  | 'boots'

export type ItemType =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'helmet'
  | 'ring'
  | 'amulet'
  | 'boots'
  | 'consumable'
  | 'misc'

export type ItemEffect = {
  stat?: keyof Stats
  value?: number
  armorClassBonus?: number
  hpBonus?: number
  initiativeBonus?: number
}

export type ItemTemplateResponse = {
  id: string
  name: string
  type: ItemType | string | null
  slot: EquipmentSlot | string | null
  description: string | null
  allowedSlots: EquipmentSlot[] | null
  effects: ItemEffect[] | null
  createdAt: string
  updatedAt: string
}

export type CharacterItemResponse = {
  id: string
  characterId: string
  itemTemplateId: string | null
  nameSnapshot: string
  quantity: number
  isEquipped: boolean
  equippedSlot: EquipmentSlot | string | null
  notes: string | null
  type: ItemType | string | null
  allowedSlots: EquipmentSlot[] | null
  effects: ItemEffect[] | null
  createdAt: string
  updatedAt: string
  itemTemplate: ItemTemplateResponse | null
}

export type Item = {
  id: string
  name: string
  type: ItemType | string
  allowedSlots: EquipmentSlot[]
  effects: ItemEffect[]
}

export type ItemTemplate = {
  id: string
  name: string
  type: ItemType | string | null
  slot: EquipmentSlot | string | null
  allowedSlots?: EquipmentSlot[] | null
  description?: string | null
  effects?: ItemEffect[] | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export type CharacterItem = {
  id: string
  characterId?: string
  itemTemplateId?: string | null

  nameSnapshot?: string | null
  quantity: number

  isEquipped: boolean
  equippedSlot: EquipmentSlot | string | null
  slot?: EquipmentSlot | string | null

  notes: string | null

  type?: ItemType | string | null
  allowedSlots?: EquipmentSlot[] | null
  effects?: ItemEffect[] | null

  createdAt?: string | Date
  updatedAt?: string | Date

  itemTemplate?: ItemTemplate | null
  template?: ItemTemplate | null
}

export type CharacterItemForSheet = {
  id: string
  itemId: string
  characterId?: string
  itemTemplateId?: string | null
  nameSnapshot?: string | null
  name: string

  type: ItemType | string | null
  effects: ItemEffect[]
  allowedSlots: EquipmentSlot[]

  isEquipped: boolean
  equippedSlot: EquipmentSlot | null

  quantity: number
  notes: string | null
}
