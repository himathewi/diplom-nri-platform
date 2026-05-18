import type { User } from './user'
import type { GameSession } from './session'
import type { SessionEvent } from './sessionEvent'

export type DecisionCharacter = {
  id: string
  userId: string
  name: string
  description?: string | null
  profession?: string | null
  competence?: string | null
  user?: User
  createdAt: string
  updatedAt: string
}

export type Decision = {
  id: string
  sessionId: string
  characterId?: string | null
  userId: string
  eventId?: string | null

  description: string
  result?: string | null
  moderatorComment?: string | null
  score?: number | null

  createdAt: string
  updatedAt: string

  session?: GameSession
  character?: DecisionCharacter | null
  user?: User
  event?: SessionEvent | null
}

export type CreateDecisionPayload = {
  characterId?: string | null
  eventId?: string | null
  description: string
  result?: string | null
}

export type UpdateDecisionPayload = {
  characterId?: string | null
  eventId?: string | null
  description?: string
  result?: string | null
}

export type EvaluateDecisionPayload = {
  result?: string | null
  moderatorComment?: string | null
  score?: number | null
}