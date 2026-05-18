import { sessionsRepository } from './sessions.repository'
import type {
  AddSessionParticipantInput,
  CreateSessionInput,
  UpdateSessionInput,
} from './sessions.schemas'
import {
  CharacterNotFoundForSessionError,
  ScenarioNotFoundForSessionError,
  SessionAlreadyFinishedError,
  SessionAlreadyStartedError,
  SessionForbiddenError,
  SessionNotActiveError,
  SessionNotFoundError,
  SessionParticipantAlreadyExistsError,
  SessionParticipantNotFoundError,
  TeamNotFoundForSessionError,
} from './sessions.errors'

type CurrentUser = {
  id: string
  role?: string | null
}

function canManageSessions(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

function canViewAllSessions(currentUser: CurrentUser) {
  return (
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MODERATOR' ||
    currentUser.role === 'EXPERT'
  )
}

async function validateScenario(scenarioId: string) {
  const scenario = await sessionsRepository.findScenarioById(scenarioId)

  if (!scenario) {
    throw new ScenarioNotFoundForSessionError(scenarioId)
  }

  return scenario
}

async function validateTeam(teamId?: string | null) {
  if (!teamId) {
    return null
  }

  const team = await sessionsRepository.findTeamById(teamId)

  if (!team) {
    throw new TeamNotFoundForSessionError(teamId)
  }

  return team
}

export const sessionsService = {
  async getSessions(currentUser: CurrentUser) {
    if (canViewAllSessions(currentUser)) {
      return sessionsRepository.findMany()
    }

    return sessionsRepository.findManyByUserId(currentUser.id)
  },

  async getSessionById(id: string, currentUser: CurrentUser) {
    const session = await sessionsRepository.findById(id)

    if (!session) {
      throw new SessionNotFoundError(id)
    }

    if (canViewAllSessions(currentUser)) {
      return session
    }

    const isTeamMember = session.team?.members.some(
      (member) => member.userId === currentUser.id,
    )

    const isParticipant = session.participants.some(
      (participant) => participant.character.userId === currentUser.id,
    )

    if (!isTeamMember && !isParticipant) {
      throw new SessionForbiddenError()
    }

    return session
  },

  async createSession(data: CreateSessionInput, currentUser: CurrentUser) {
    if (!canManageSessions(currentUser)) {
      throw new SessionForbiddenError()
    }

    await validateScenario(data.scenarioId)
    await validateTeam(data.teamId)

    return sessionsRepository.create(data, currentUser.id)
  },

  async updateSession(
    id: string,
    data: UpdateSessionInput,
    currentUser: CurrentUser,
  ) {
    if (!canManageSessions(currentUser)) {
      throw new SessionForbiddenError()
    }

    const session = await sessionsRepository.findById(id)

    if (!session) {
      throw new SessionNotFoundError(id)
    }

    if (session.status === 'FINISHED') {
      throw new SessionAlreadyFinishedError(id)
    }

    if (data.scenarioId) {
      await validateScenario(data.scenarioId)
    }

    if ('teamId' in data) {
      await validateTeam(data.teamId)
    }

    return sessionsRepository.update(id, data)
  },

  async deleteSession(id: string, currentUser: CurrentUser) {
    if (currentUser.role !== 'ADMIN') {
      throw new SessionForbiddenError()
    }

    const session = await sessionsRepository.findById(id)

    if (!session) {
      throw new SessionNotFoundError(id)
    }

    return sessionsRepository.delete(id)
  },

  async startSession(id: string, currentUser: CurrentUser) {
    if (!canManageSessions(currentUser)) {
      throw new SessionForbiddenError()
    }

    const session = await sessionsRepository.findById(id)

    if (!session) {
      throw new SessionNotFoundError(id)
    }

    if (session.status === 'ACTIVE') {
      throw new SessionAlreadyStartedError(id)
    }

    if (session.status === 'FINISHED') {
      throw new SessionAlreadyFinishedError(id)
    }

    return sessionsRepository.start(id)
  },

  async finishSession(id: string, currentUser: CurrentUser) {
    if (!canManageSessions(currentUser)) {
      throw new SessionForbiddenError()
    }

    const session = await sessionsRepository.findById(id)

    if (!session) {
      throw new SessionNotFoundError(id)
    }

    if (session.status === 'FINISHED') {
      throw new SessionAlreadyFinishedError(id)
    }

    if (session.status !== 'ACTIVE') {
      throw new SessionNotActiveError(id)
    }

    return sessionsRepository.finish(id)
  },

  async addParticipant(
    sessionId: string,
    data: AddSessionParticipantInput,
    currentUser: CurrentUser,
  ) {
    if (!canManageSessions(currentUser)) {
      throw new SessionForbiddenError()
    }

    const session = await sessionsRepository.findById(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (session.status === 'FINISHED') {
      throw new SessionAlreadyFinishedError(sessionId)
    }

    const character = await sessionsRepository.findCharacterById(data.characterId)

    if (!character) {
      throw new CharacterNotFoundForSessionError(data.characterId)
    }

    const existingParticipant = await sessionsRepository.findParticipant(
      sessionId,
      data.characterId,
    )

    if (existingParticipant) {
      throw new SessionParticipantAlreadyExistsError(data.characterId)
    }

    return sessionsRepository.addParticipant(sessionId, data)
  },

  async removeParticipant(
    sessionId: string,
    participantId: string,
    currentUser: CurrentUser,
  ) {
    if (!canManageSessions(currentUser)) {
      throw new SessionForbiddenError()
    }

    const session = await sessionsRepository.findById(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (session.status === 'FINISHED') {
      throw new SessionAlreadyFinishedError(sessionId)
    }

    const participant = await sessionsRepository.findParticipantById(participantId)

    if (!participant || participant.sessionId !== sessionId) {
      throw new SessionParticipantNotFoundError(participantId)
    }

    return sessionsRepository.removeParticipant(participantId)
  },
}