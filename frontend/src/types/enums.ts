export type UserRole = 'ADMIN' | 'MODERATOR' | 'PARTICIPANT'

export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED'

export type ScenarioDomain =
  | 'CROP_PRODUCTION'
  | 'GREENHOUSE'
  | 'LIVESTOCK'
  | 'LOGISTICS'
  | 'PROCESSING'
  | 'ROBOTICS'
  | 'TEAMBUILDING'

export type SessionEventType =
  | 'PRODUCTION_PROBLEM'
  | 'WEATHER_CHANGE'
  | 'RESOURCE_LIMIT'
  | 'EQUIPMENT_FAILURE'
  | 'TEAM_CONFLICT'
  | 'INFORMATION_UPDATE'