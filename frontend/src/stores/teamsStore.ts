import { create } from 'zustand'
import { teamsApi } from '../api/teamsApi'
import type {
  AddTeamMemberPayload,
  CreateTeamPayload,
  Team,
  TeamMember,
  TeamsStatus,
  UpdateTeamPayload,
} from '../types/team'

type TeamsStore = {
  teams: Team[]
  selectedTeam: Team | null

  status: TeamsStatus
  error: string | null

  fetchTeams: () => Promise<void>
  fetchTeamById: (id: string) => Promise<void>
  createTeam: (payload: CreateTeamPayload) => Promise<Team | null>
  updateTeam: (id: string, payload: UpdateTeamPayload) => Promise<Team | null>
  deleteTeam: (id: string) => Promise<boolean>
  addTeamMember: (
    teamId: string,
    payload: AddTeamMemberPayload,
  ) => Promise<TeamMember | null>
  removeTeamMember: (teamId: string, userId: string) => Promise<boolean>

  setSelectedTeam: (team: Team | null) => void
  clearError: () => void
  resetTeamsState: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Произошла ошибка при работе с командами'
}

function addMemberToTeam(team: Team, member: TeamMember) {
  return {
    ...team,
    members: [...team.members, member],
  }
}

function removeMemberFromTeam(team: Team, userId: string) {
  return {
    ...team,
    members: team.members.filter((member) => member.userId !== userId),
  }
}

export const useTeamsStore = create<TeamsStore>((set, get) => ({
  teams: [],
  selectedTeam: null,

  status: 'idle',
  error: null,

  async fetchTeams() {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const teams = await teamsApi.getTeams()

      set({
        teams,
        status: 'success',
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  async fetchTeamById(id) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const selectedTeam = await teamsApi.getTeamById(id)

      set({
        selectedTeam,
        status: 'success',
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  async createTeam(payload) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const team = await teamsApi.createTeam(payload)

      set({
        teams: [team, ...get().teams],
        selectedTeam: team,
        status: 'success',
        error: null,
      })

      return team
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })

      return null
    }
  },

  async updateTeam(id, payload) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const updatedTeam = await teamsApi.updateTeam(id, payload)

      set({
        teams: get().teams.map((team) =>
          team.id === id ? updatedTeam : team,
        ),
        selectedTeam:
          get().selectedTeam?.id === id
            ? updatedTeam
            : get().selectedTeam,
        status: 'success',
        error: null,
      })

      return updatedTeam
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })

      return null
    }
  },

  async deleteTeam(id) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      await teamsApi.deleteTeam(id)

      set({
        teams: get().teams.filter((team) => team.id !== id),
        selectedTeam:
          get().selectedTeam?.id === id ? null : get().selectedTeam,
        status: 'success',
        error: null,
      })

      return true
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })

      return false
    }
  },

  async addTeamMember(teamId, payload) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const member = await teamsApi.addTeamMember(teamId, payload)

      set({
        teams: get().teams.map((team) =>
          team.id === teamId ? addMemberToTeam(team, member) : team,
        ),
        selectedTeam:
          get().selectedTeam?.id === teamId
            ? addMemberToTeam(get().selectedTeam as Team, member)
            : get().selectedTeam,
        status: 'success',
        error: null,
      })

      return member
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })

      return null
    }
  },

  async removeTeamMember(teamId, userId) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      await teamsApi.removeTeamMember(teamId, userId)

      set({
        teams: get().teams.map((team) =>
          team.id === teamId ? removeMemberFromTeam(team, userId) : team,
        ),
        selectedTeam:
          get().selectedTeam?.id === teamId
            ? removeMemberFromTeam(get().selectedTeam as Team, userId)
            : get().selectedTeam,
        status: 'success',
        error: null,
      })

      return true
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })

      return false
    }
  },

  setSelectedTeam(team) {
    set({
      selectedTeam: team,
    })
  },

  clearError() {
    set({
      error: null,
    })
  },

  resetTeamsState() {
    set({
      teams: [],
      selectedTeam: null,
      status: 'idle',
      error: null,
    })
  },
}))