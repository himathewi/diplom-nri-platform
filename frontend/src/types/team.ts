import type { User } from './user'

export type TeamMember = {
  id: string
  teamId: string
  userId: string
  roleInTeam: string | null
  createdAt: string
  user: User
}

export type Team = {
  id: string
  name: string
  companyName: string | null
  description: string | null
  members: TeamMember[]
  createdAt: string
  updatedAt: string
}

export type CreateTeamPayload = {
  name: string
  companyName?: string | null
  description?: string | null
}

export type UpdateTeamPayload = Partial<CreateTeamPayload>

export type AddTeamMemberPayload = {
  userId: string
  roleInTeam?: string | null
}

export type TeamsStatus = 'idle' | 'loading' | 'success' | 'error'