export type RoleClassEntity = {
  id: string
  name: string
  description: string | null
}

export type UserEntity = {
  id: string
  email: string
  name: string
  role: string
}

export type CharacterEntity = {
  id: string
  userId: string
  roleClassId: string | null
  name: string
  description: string | null
  professionalFunction: string | null
  fatigueLimit: number
  currentFatigue: number
  roleClass: RoleClassEntity | null
  user: UserEntity
  sessionParticipants: SessionParticipantEntity[]
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
  description: string | null
  effects: unknown
  createdAt?: Date
  updatedAt?: Date
}

export type CharacterItemEntity = {
  id: string
  characterId: string
  nameSnapshot: string
  quantity: number
  notes: string | null
  itemTemplateId: string | null
  type: string | null
  effects: unknown
  itemTemplate?: ItemTemplateEntity | null
}

export type SessionParticipantEntity = {
  id: string
  sessionId: string
  createdAt: Date
  session: {
    id: string
    status: string
    createdAt: Date
    scenario: {
      id: string
      title: string
      description: string
      domain: string
      goal: string
      difficulty: number
    }
    team: {
      id: string
      name: string
      companyName: string | null
    } | null
  }
}

export type CharacterRepository = {
  findByIdForSheet: (id: string) => Promise<CharacterEntity | null>
}

export type CharacterStatsRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterStatsEntity | null>
}

export type CharacterItemRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterItemEntity[]>
}
