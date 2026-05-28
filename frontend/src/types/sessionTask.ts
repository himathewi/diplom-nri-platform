import type { Character } from './characters'
import type { GameSession } from './session'
import type { TaskTemplate } from './taskTemplate'
import type { User } from './user'

export type SessionTaskStatus =
  | 'HIDDEN'
  | 'VISIBLE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'

export type TaskAttemptStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export type SessionTask = {
  id: string
  sessionId: string
  taskTemplateId: string | null

  title: string
  descriptionForModerator: string
  descriptionForParticipants: string

  difficulty: number
  fatigueCost: number | null
  status: SessionTaskStatus
  isVisibleToParticipants: boolean

  createdAt: string
  updatedAt: string

  session?: GameSession
  taskTemplate?: TaskTemplate | null
  attempts?: TaskAttempt[]
}

export type TaskAttempt = {
  id: string
  sessionTaskId: string
  participantId: string | null
  characterId: string | null
  userId: string | null

  description: string
  result: string | null
  status: TaskAttemptStatus
  moderatorComment: string | null
  score: number | null

  createdAt: string
  updatedAt: string

  sessionTask?: SessionTask
  character?: Character | null
  user?: User | null
}

export type CreateSessionTaskPayload = {
  taskTemplateId?: string | null
  title?: string
  descriptionForModerator?: string
  descriptionForParticipants?: string
  difficulty?: number
  fatigueCost?: number | null
  isVisibleToParticipants?: boolean
}

export type UpdateSessionTaskPayload = Partial<CreateSessionTaskPayload> & {
  status?: SessionTaskStatus
}

export type CreateTaskAttemptPayload = {
  participantId?: string | null
  characterId?: string | null
  description: string
  result?: string | null
}

export type UpdateSessionTaskStatusPayload = {
  status: SessionTaskStatus
}

export type EvaluateTaskAttemptPayload = {
  status: TaskAttemptStatus
  score?: number | null
  moderatorComment?: string | null
}