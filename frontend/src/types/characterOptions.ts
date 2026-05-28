import type { RoleClass } from './roleClass'
import type { SessionTask } from './sessionTask'

export type CharacterCreationRules = {
  allowMultipleProfiles: boolean
  allowProfileCreationAfterStart: boolean
  maxStartingItems: number | null
  defaultFatigueLimit: number
}

export type CharacterOptionItem = {
  id: string
  itemTemplateId: string
  name: string
  type: string | null
  publicDescription: string | null
  quantity: number | null
}

export type CharacterOptionsSession = {
  id: string
  status: string
  scenario: {
    id: string
    title: string
    description: string
    goal?: string | null
  }
  team?: {
    id: string
    name: string
    companyName: string | null
  } | null
}

export type CharacterOptions = {
  session: CharacterOptionsSession
  allowedRoleClasses: RoleClass[]
  availableStartingItems: CharacterOptionItem[]
  visibleTasks: SessionTask[]
  rules: CharacterCreationRules
}