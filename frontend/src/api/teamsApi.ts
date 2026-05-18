import { httpClient } from './httpClient'
import type {
  AddTeamMemberPayload,
  CreateTeamPayload,
  Team,
  TeamMember,
  UpdateTeamPayload,
} from '../types/team'

export const teamsApi = {
  getTeams() {
    return httpClient.get<Team[]>('/teams')
  },

  getTeamById(id: string) {
    return httpClient.get<Team>(`/teams/${id}`)
  },

  createTeam(payload: CreateTeamPayload) {
    return httpClient.post<Team>('/teams', payload)
  },

  updateTeam(id: string, payload: UpdateTeamPayload) {
    return httpClient.patch<Team>(`/teams/${id}`, payload)
  },

  deleteTeam(id: string) {
    return httpClient.delete<void>(`/teams/${id}`)
  },

  addTeamMember(teamId: string, payload: AddTeamMemberPayload) {
    return httpClient.post<TeamMember>(`/teams/${teamId}/members`, payload)
  },

  removeTeamMember(teamId: string, userId: string) {
    return httpClient.delete<void>(`/teams/${teamId}/members/${userId}`)
  },
}