export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED'

export type UserRole = 'ADMIN' | 'MODERATOR' | 'PARTICIPANT'

export type ScenarioDomain =
  | 'CROP_PRODUCTION'
  | 'GREENHOUSE'
  | 'LIVESTOCK'
  | 'LOGISTICS'
  | 'PROCESSING'
  | 'ROBOTICS'
  | 'TEAMBUILDING'

export type UserSummary = {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type ScenarioTaskSummary = {
  id: string
  scenarioId: string
  title: string
  description: string
  taskType: string
  expectedResult: string | null
  createdAt: string
}

export type ScenarioSummary = {
  id: string
  title: string
  description: string
  domain: ScenarioDomain
  goal: string
  difficulty: number
  createdById: string
  createdBy: UserSummary
  tasks: ScenarioTaskSummary[]
  createdAt: string
  updatedAt: string
}

export type TeamMemberSummary = {
  id: string
  teamId: string
  userId: string
  roleInTeam: string | null
  createdAt: string
  user: UserSummary
}

export type TeamSummary = {
  id: string
  name: string
  companyName: string | null
  description: string | null
  members: TeamMemberSummary[]
  createdAt: string
  updatedAt: string
}

export type CharacterSummary = {
  id: string
  userId: string
  name: string
  description: string | null
  profession: string | null
  competence: string | null
  createdAt: string
  updatedAt: string
  user: UserSummary
}

export type SessionParticipant = {
  id: string
  sessionId: string
  characterId: string
  createdAt: string
  character: CharacterSummary
}

export type SessionEventSummary = {
  id: string
  sessionId: string
  title: string
  description: string
  eventType: string
  impact: string | null
  createdById: string
  createdAt: string
}

export type DecisionSummary = {
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

export type TeamMetricSummary = {
  id: string
  sessionId: string
  communicationScore: number
  decisionSpeedScore: number
  roleDistributionScore: number
  conflictResolutionScore: number
  leadershipScore: number
  comment: string | null
  createdAt: string
  updatedAt: string
}

export type SessionReportSummary = {
  id: string
  sessionId: string
  summary: string
  successfulDecisions: string | null
  failedDecisions: string | null
  recommendations: string | null
  createdAt: string
  updatedAt: string
}

export type GameSession = {
  id: string
  scenarioId: string
  teamId: string | null
  moderatorId: string
  status: SessionStatus

  scenario: ScenarioSummary
  team: TeamSummary | null
  moderator: UserSummary
  participants: SessionParticipant[]
  events: SessionEventSummary[]
  decisions: DecisionSummary[]
  metrics: TeamMetricSummary | null
  report: SessionReportSummary | null

  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateSessionPayload = {
  scenarioId: string
  teamId?: string | null
}

export type UpdateSessionPayload = {
  scenarioId?: string
  teamId?: string | null
}

export type AddSessionParticipantPayload = {
  characterId: string
}
