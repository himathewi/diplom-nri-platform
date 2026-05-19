export type ReportUserRole = 'ADMIN' | 'MODERATOR' | 'PARTICIPANT' | 'EXPERT'

export type ReportSessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED'

export type ReportScenarioDomain =
  | 'CROP_PRODUCTION'
  | 'GREENHOUSE'
  | 'LIVESTOCK'
  | 'LOGISTICS'
  | 'PROCESSING'
  | 'ROBOTICS'
  | 'TEAMBUILDING'
  | 'OTHER'

export type ReportEventType =
  | 'PRODUCTION_PROBLEM'
  | 'WEATHER_CHANGE'
  | 'RESOURCE_LIMIT'
  | 'EQUIPMENT_FAILURE'
  | 'TEAM_CONFLICT'
  | 'INFORMATION_UPDATE'

export type ReportUser = {
  id: string
  email: string
  name: string
  role: ReportUserRole
  createdAt: string
  updatedAt: string
}

export type ReportCharacter = {
  id: string
  userId: string
  name: string
  description?: string | null
  profession?: string | null
  competence?: string | null
  user?: ReportUser
  createdAt: string
  updatedAt: string
}

export type ReportScenarioTask = {
  id: string
  scenarioId: string
  title: string
  description: string
  expectedResult?: string | null
  createdAt: string
  updatedAt: string
}

export type ReportScenario = {
  id: string
  title: string
  description: string
  domain: ReportScenarioDomain
  goal: string
  difficulty: number
  createdById: string
  createdBy?: ReportUser
  tasks?: ReportScenarioTask[]
  createdAt: string
  updatedAt: string
}

export type ReportTeamMember = {
  id: string
  teamId: string
  userId: string
  roleInTeam?: string | null
  user?: ReportUser
  createdAt: string
}

export type ReportTeam = {
  id: string
  name: string
  companyName?: string | null
  description?: string | null
  members?: ReportTeamMember[]
  createdAt: string
  updatedAt: string
}

export type ReportSessionParticipant = {
  id: string
  sessionId: string
  characterId: string
  character: ReportCharacter
  createdAt: string
}

export type ReportSessionEvent = {
  id: string
  sessionId: string
  title: string
  description: string
  eventType: ReportEventType
  impact?: string | null
  createdById: string
  createdAt: string
  updatedAt: string
}

export type ReportDecision = {
  id: string
  sessionId: string
  eventId?: string | null
  characterId?: string | null
  userId?: string | null
  description: string
  result?: string | null
  score?: number | null
  moderatorComment?: string | null
  character?: ReportCharacter | null
  user?: ReportUser | null
  event?: ReportSessionEvent | null
  createdAt: string
  updatedAt: string
}

export type ReportTeamMetric = {
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
}

export type ReportGameSession = {
  id: string
  scenarioId: string
  teamId?: string | null
  moderatorId?: string | null
  title: string
  description?: string | null
  status: ReportSessionStatus
  startedAt?: string | null
  finishedAt?: string | null

  scenario: ReportScenario
  team?: ReportTeam | null
  moderator?: ReportUser | null
  participants?: ReportSessionParticipant[]
  events?: ReportSessionEvent[]
  decisions?: ReportDecision[]
  metrics?: ReportTeamMetric | null
  report?: SessionReport | null

  createdAt: string
  updatedAt: string
}

export type SessionReport = {
  id: string
  sessionId: string
  summary: string
  successfulActions?: string | null
  problemActions?: string | null
  recommendations?: string | null
  session?: ReportGameSession
  createdAt: string
  updatedAt: string
}

export type CreateReportPayload = {
  summary?: string
  successfulActions?: string | null
  problemActions?: string | null
  recommendations?: string | null
}

export type UpdateReportPayload = {
  summary?: string
  successfulActions?: string | null
  problemActions?: string | null
  recommendations?: string | null
}