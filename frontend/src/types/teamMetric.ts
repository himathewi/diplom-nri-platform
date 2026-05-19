import type { GameSession } from './session'

export type TeamMetric = {
  id: string
  sessionId: string

  communicationScore: number
  decisionSpeedScore: number
  roleDistributionScore: number
  conflictResolutionScore: number
  leadershipScore: number

  comment?: string | null

  createdAt: string
  updatedAt: string

  session?: GameSession
}

export type CreateTeamMetricPayload = {
  communicationScore?: number
  decisionSpeedScore?: number
  roleDistributionScore?: number
  conflictResolutionScore?: number
  leadershipScore?: number
  comment?: string | null
}

export type UpdateTeamMetricPayload = {
  communicationScore?: number
  decisionSpeedScore?: number
  roleDistributionScore?: number
  conflictResolutionScore?: number
  leadershipScore?: number
  comment?: string | null
}

export type TeamMetricsStatus = 'idle' | 'loading' | 'success' | 'error'