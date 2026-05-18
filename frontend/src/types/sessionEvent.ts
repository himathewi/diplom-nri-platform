import type { GameSession } from './session'

export type SessionEventType =
  | 'PRODUCTION_PROBLEM'
  | 'WEATHER_CHANGE'
  | 'RESOURCE_LIMIT'
  | 'EQUIPMENT_FAILURE'
  | 'TEAM_CONFLICT'
  | 'INFORMATION_UPDATE'

export type SessionEventDecision = {
  id: string
  sessionId: string
  characterId: string
  eventId: string | null
  description: string
  result: string | null
  score: number | null
  createdAt: string
  updatedAt: string
}

export type SessionEvent = {
  id: string
  sessionId: string
  title: string
  description: string
  eventType: SessionEventType
  impact: string | null
  createdAt: string

  decisions?: SessionEventDecision[]
  session?: GameSession
}

export type CreateSessionEventPayload = {
  title: string
  description: string
  eventType: SessionEventType
  impact?: string | null
}

export type UpdateSessionEventPayload = Partial<CreateSessionEventPayload>