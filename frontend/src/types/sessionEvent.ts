import type { GameSession } from './session'

import type { SessionEventType } from './enums'

export type { SessionEventType } from './enums'

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