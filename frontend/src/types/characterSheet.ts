import type {
  CharacterSessionParticipation,
  CharacterUser,
  RoleClass,
  Stats,
} from './characters'
import type { CharacterItemForSheet } from './items'

export type AbilityName = keyof Stats

export type CharacterProfile = {
  id: string
  userId: string
  roleClassId: string | null
  name: string
  description: string | null
  professionalFunction: string | null
  fatigueLimit: number
  currentFatigue: number
  roleClass: RoleClass | null
  user: CharacterUser
  createdAt: string
  updatedAt: string
}

export type CharacterSheet = {
  character: CharacterProfile
  user: CharacterUser
  roleClass: RoleClass | null

  stats: {
    base: Stats
    final: Stats
    modifiers: Record<AbilityName, number>
  }

  fatigue: {
    limit: number
    current: number
    remaining: number
  }

  inventory: {
    items: CharacterItemForSheet[]
  }

  sessions: CharacterSessionParticipation[]
}
