import type {
  AbilityScores,
  AttributeEffectDto,
  CharacterFatigueDto,
} from './character-sheet.calculation'

export type AbilityModifiers = AbilityScores

export type RoleClassDto = {
  id: string
  name: string
  description: string | null
}

export type CharacterUserDto = {
  id: string
  email: string
  name: string
  role: string
}

export type ScenarioDirectionDto = {
  id: string
  code: string
  name: string
  description: string | null
}

export type CharacterScenarioDto = {
  id: string
  title: string
  description: string
  goal: string
  difficulty: number
  direction: ScenarioDirectionDto | null
}

export type CharacterTeamDto = {
  id: string
  name: string
  companyName: string | null
} | null

export type CharacterProfileDto = {
  id: string
  userId: string
  roleClassId: string | null
  name: string
  description: string | null
  professionalFunction: string | null
  fatigueLimit: number
  currentFatigue: number
  createdAt: Date
  updatedAt: Date
}

export type CharacterStatsDto = {
  base: AbilityScores
  itemEffects: AttributeEffectDto[]
  final: AbilityScores
  modifiers: AbilityModifiers
}

export type CharacterParticipantItemDto = {
  id: string
  sessionParticipantId: string
  itemId: string | null
  nameSnapshot: string
  name: string
  type: string | null
  description: string | null
  quantity: number
  notes: string | null
  isUsed: boolean
  attributeEffects: AttributeEffectDto[]
  createdAt: Date
  updatedAt: Date
}

export type CharacterSessionDto = {
  id: string
  sessionId: string
  userId: string
  characterId: string | null
  status: string
  scenario: CharacterScenarioDto
  team: CharacterTeamDto
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type CharacterSessionResourcesDto = {
  sessionParticipantId: string
  sessionId: string
  status: string
  scenario: CharacterScenarioDto
  items: CharacterParticipantItemDto[]
}

export type CharacterSheetDto = {
  character: CharacterProfileDto
  user: CharacterUserDto
  roleClass: RoleClassDto | null
  stats: CharacterStatsDto
  fatigue: CharacterFatigueDto
  sessions: CharacterSessionDto[]
  sessionResources: CharacterSessionResourcesDto[]
}