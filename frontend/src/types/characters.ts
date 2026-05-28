export type AbilityKey =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma'

export type Stats = Record<AbilityKey, number>

export type CharacterUser = {
  id: string
  email: string
  name: string
  role: string
}

export type CharacterSessionParticipation = {
  id: string
  sessionId: string
  characterId: string
  createdAt: string
  session?: {
    id: string
    status: string
    scenario?: {
      id: string
      title: string
      description: string
    } | null
    team?: {
      id: string
      name: string
      companyName: string | null
    } | null
  }
}

export type RoleClass = {
  id: string
  name: string
  description: string | null
  createdAt?: string
  updatedAt?: string
}

export type Character = {
  id: string
  userId: string
  roleClassId: string | null
  name: string
  description: string | null
  professionalFunction: string | null
  fatigueLimit: number
  currentFatigue: number
  roleClass?: RoleClass | null
  stats?: Stats | null
  createdAt: string
  updatedAt: string
}

export type CreateSessionCharacterPayload = {
  name: string
  roleClassId: string
  description?: string | null
  professionalFunction?: string | null
  baseStats?: Stats
}

export type CreateCharacterPayload = CreateSessionCharacterPayload

export type UpdateCharacterPayload = {
  name?: string
  roleClassId?: string | null
  description?: string | null
  professionalFunction?: string | null
  currentFatigue?: number
}