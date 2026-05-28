import type { User } from './user'
import type { GameSession } from './session'
import type { SessionEvent } from './sessionEvent'
import type { SessionTask, TaskAttempt } from './sessionTask'

export type DecisionCharacter = {
  id: string
  userId: string
  roleClassId: string | null
  name: string
  description?: string | null
  professionalFunction?: string | null
  fatigueLimit?: number
  currentFatigue?: number
  user?: User
  createdAt: string
  updatedAt: string
}

export type Decision = {
  id: string
  sessionId: string
  characterId?: string | null
  userId?: string | null
  eventId?: string | null
  sessionTaskId?: string | null
  taskAttemptId?: string | null

  description: string
  result?: string | null
  moderatorComment?: string | null
  score?: number | null

  createdAt: string
  updatedAt: string

  session?: GameSession
  character?: DecisionCharacter | null
  user?: User | null
  event?: SessionEvent | null
  sessionTask?: SessionTask | null
  taskAttempt?: TaskAttempt | null
}

export type CreateDecisionPayload = {
  characterId?: string | null
  eventId?: string | null
  sessionTaskId?: string | null
  taskAttemptId?: string | null
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