// =========================================================
// Entity contracts for CharacterSheetService
// =========================================================

export type CharacterEntity = {
  id: string
  name: string
  race: string
  className: string
  level: number

  description: string | null
  alignment: string | null
  background: string | null
  avatarUrl: string | null

  currentHp: number
  temporaryHp: number
  speed: number
  inspiration: boolean

  createdAt: Date
  updatedAt: Date
}

export type CharacterStatsEntity = {
  characterId: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type ItemTemplateEntity = {
  id: string
  name: string
  type: string | null
  slot: string | null
  description: string | null
  allowedSlots: unknown
  effects: unknown
  createdAt?: Date
  updatedAt?: Date
}

export type CharacterItemEntity = {
  id: string
  characterId: string
  nameSnapshot: string
  quantity: number
  isEquipped: boolean
  equippedSlot: string | null
  notes: string | null
  itemTemplateId: string | null

  type: string | null
  allowedSlots: unknown
  effects: unknown

  itemTemplate?: ItemTemplateEntity | null
}

// =========================================================
// Repository contracts for CharacterSheetService
// =========================================================

export type CharacterRepository = {
  findByIdForSheet: (id: string) => Promise<CharacterEntity | null>
}

export type CharacterStatsRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterStatsEntity | null>
}

export type CharacterItemRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterItemEntity[]>
}
