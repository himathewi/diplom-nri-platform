import type { User } from './user'

export type ItemType =
  | 'TOOL'
  | 'DOCUMENT'
  | 'EQUIPMENT'
  | 'SENSOR'
  | 'CONSUMABLE'
  | 'OTHER'

export type CatalogItem = {
  id: string
  name: string
  type: ItemType
  description: string | null
  isPublic: boolean
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string

  createdBy?: User | null
}

export type SessionAllowedItem = {
  id: string
  sessionId: string
  itemId: string
  quantity: number
  isVisible: boolean
  notes: string | null
  createdAt: string
  updatedAt: string

  item: CatalogItem
}

export type ParticipantItem = {
  id: string
  participantId: string
  itemId: string | null
  nameSnapshot: string
  quantity: number
  notes: string | null
  isUsed: boolean
  createdAt: string
  updatedAt: string

  item?: CatalogItem | null
}

export type CreateCatalogItemPayload = {
  name: string
  type?: ItemType
  description?: string | null
  isPublic?: boolean
  isActive?: boolean
}

export type UpdateCatalogItemPayload = Partial<CreateCatalogItemPayload>

export type AllowSessionItemPayload = {
  itemId: string
  quantity?: number
  isVisible?: boolean
  notes?: string | null
}

export type UpdateSessionAllowedItemPayload = {
  quantity?: number
  isVisible?: boolean
  notes?: string | null
}

export type GrantParticipantItemPayload = {
  itemId?: string | null
  nameSnapshot?: string
  quantity?: number
  notes?: string | null
}

export type UpdateParticipantItemPayload = {
  nameSnapshot?: string
  quantity?: number
  notes?: string | null
  isUsed?: boolean
}