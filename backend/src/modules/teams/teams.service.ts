import { usersRepository } from '../users/users.repository'
import { UserNotFoundError } from '../users/users.errors'
import { teamsRepository } from './teams.repository'
import type {
  AddTeamMemberInput,
  CreateTeamInput,
  UpdateTeamInput,
} from './teams.schemas'
import {
  TeamForbiddenError,
  TeamMemberAlreadyExistsError,
  TeamMemberNotFoundError,
  TeamNotFoundError,
} from './teams.errors'

type CurrentUser = {
  id: string
  role?: string | null
}

function canManageTeams(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

export const teamsService = {
  async getTeams(currentUser: CurrentUser) {
    if (canManageTeams(currentUser)) {
      return teamsRepository.findMany()
    }

    return teamsRepository.findManyByUserId(currentUser.id)
  },

  async getTeamById(id: string, currentUser: CurrentUser) {
    const team = await teamsRepository.findById(id)

    if (!team) {
      throw new TeamNotFoundError(id)
    }

    if (canManageTeams(currentUser)) {
      return team
    }

    const isMember = team.members.some((member) => member.userId === currentUser.id)

    if (!isMember) {
      throw new TeamForbiddenError()
    }

    return team
  },

  async createTeam(data: CreateTeamInput, currentUser: CurrentUser) {
    if (!canManageTeams(currentUser)) {
      throw new TeamForbiddenError()
    }

    return teamsRepository.create(data)
  },

  async updateTeam(
    id: string,
    data: UpdateTeamInput,
    currentUser: CurrentUser,
  ) {
    if (!canManageTeams(currentUser)) {
      throw new TeamForbiddenError()
    }

    const team = await teamsRepository.findById(id)

    if (!team) {
      throw new TeamNotFoundError(id)
    }

    return teamsRepository.update(id, data)
  },

  async deleteTeam(id: string, currentUser: CurrentUser) {
    if (currentUser.role !== 'ADMIN') {
      throw new TeamForbiddenError()
    }

    const team = await teamsRepository.findById(id)

    if (!team) {
      throw new TeamNotFoundError(id)
    }

    return teamsRepository.delete(id)
  },

  async addMember(
    teamId: string,
    data: AddTeamMemberInput,
    currentUser: CurrentUser,
  ) {
    if (!canManageTeams(currentUser)) {
      throw new TeamForbiddenError()
    }

    const team = await teamsRepository.findById(teamId)

    if (!team) {
      throw new TeamNotFoundError(teamId)
    }

    const user = await usersRepository.findById(data.userId)

    if (!user) {
      throw new UserNotFoundError(data.userId)
    }

    const existingMember = await teamsRepository.findMember(teamId, data.userId)

    if (existingMember) {
      throw new TeamMemberAlreadyExistsError(data.userId)
    }

    return teamsRepository.addMember(teamId, data)
  },

  async removeMember(
    teamId: string,
    userId: string,
    currentUser: CurrentUser,
  ) {
    if (!canManageTeams(currentUser)) {
      throw new TeamForbiddenError()
    }

    const team = await teamsRepository.findById(teamId)

    if (!team) {
      throw new TeamNotFoundError(teamId)
    }

    const existingMember = await teamsRepository.findMember(teamId, userId)

    if (!existingMember) {
      throw new TeamMemberNotFoundError(userId)
    }

    return teamsRepository.removeMember(teamId, userId)
  },
}