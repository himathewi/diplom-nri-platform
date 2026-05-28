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

export type ScenarioDirectionEntity = {
  id: string
  code: string
  name: string
  description: string | null
}

export type ScenarioEntity = {
  id: string
  title: string
  description: string
  goal: string
  difficulty: number
  direction: ScenarioDirectionEntity | null
}

export type TeamEntity = {
  id: string
  name: string
  companyName: string | null
} | null

export type CharacterStatsEntity = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type ItemEntity = {
  id: string
  name: string
  type: string
  description: string | null
  attributeEffects: unknown
  isPublic: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ParticipantItemEntity = {
  id: string
  sessionParticipantId: string
  itemId: string | null
  nameSnapshot: string
  quantity: number
  notes: string | null
  isUsed: boolean
  createdAt: Date
  updatedAt: Date
  item: ItemEntity | null
}

export type SessionParticipantEntity = {
  id: string
  sessionId: string
  userId: string
  characterId: string | null
  createdAt: Date
  updatedAt: Date
  session: {
    id: string
    status: string
    startedAt: Date | null
    finishedAt: Date | null
    createdAt: Date
    updatedAt: Date
    scenario: ScenarioEntity
    team: TeamEntity
  }
  items: ParticipantItemEntity[]
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
  stats: CharacterStatsEntity | null
  sessionParticipants: SessionParticipantEntity[]
  createdAt: Date
  updatedAt: Date
}

export type CharacterRepository = {
  findByIdForSheet: (id: string) => Promise<CharacterEntity | null>
}