import type { CharacterItem } from './items'

export type Stats = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type RoleClass = {
  id: string
  name: string
  description: string | null
}

export type CharacterUser = {
  id: string
  email: string
  name: string
  role: string
}

export type CharacterSessionParticipation = {
  id: string
  sessionId: string
  status: string
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
  createdAt: string
}

export type Character = {
  id: string
  userId: string
  roleClassId: string | null
  roleClass?: RoleClass | null

  name: string
  description: string | null
  professionalFunction: string | null

  fatigueLimit: number
  currentFatigue: number

  baseStats?: Stats | null
  currentStats?: Stats

  inventory?: CharacterItem[]
  sessions?: CharacterSessionParticipation[]
  user?: CharacterUser

  createdAt: string
  updatedAt: string
}
