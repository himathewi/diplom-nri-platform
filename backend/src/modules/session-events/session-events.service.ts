import { sessionEventsRepository } from './session-events.repository'
import type {
  CreateSessionEventInput,
  UpdateSessionEventInput,
} from './session-events.schemas'
import {
  SessionEventForbiddenError,
  SessionEventNotFoundError,
  SessionEventSessionAlreadyFinishedError,
  SessionEventSessionNotActiveError,
  SessionEventSessionNotFoundError,
} from './session-events.errors'

type CurrentUser = {
  id: string
  role?: string | null
}

type SessionForAccess = Awaited<
  ReturnType<typeof sessionEventsRepository.findSessionById>
>

function canManageSessionEvents(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

function canViewAllSessionEvents(currentUser: CurrentUser) {
  return (
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MODERATOR' ||
    currentUser.role === 'EXPERT'
  )
}

function canViewSession(session: NonNullable<SessionForAccess>, currentUser: CurrentUser) {
  if (canViewAllSessionEvents(currentUser)) {
    return true
  }

  const isTeamMember = session.team?.members.some(
    (member) => member.userId === currentUser.id,
  )

  const isParticipant = session.participants.some(
    (participant) => participant.character.userId === currentUser.id,
  )

  return Boolean(isTeamMember || isParticipant)
}

function assertCanViewSession(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  if (!canViewSession(session, currentUser)) {
    throw new SessionEventForbiddenError()
  }
}

function assertCanManageSessionEvents(currentUser: CurrentUser) {
  if (!canManageSessionEvents(currentUser)) {
    throw new SessionEventForbiddenError()
  }
}

function assertSessionIsActive(session: NonNullable<SessionForAccess>) {
  if (session.status === 'FINISHED') {
    throw new SessionEventSessionAlreadyFinishedError(session.id)
  }

  if (session.status !== 'ACTIVE') {
    throw new SessionEventSessionNotActiveError(session.id)
  }
}

export const sessionEventsService = {
  async getSessionEvents(sessionId: string, currentUser: CurrentUser) {
    const session = await sessionEventsRepository.findSessionById(sessionId)

    if (!session) {
      throw new SessionEventSessionNotFoundError(sessionId)
    }

    assertCanViewSession(session, currentUser)

    return sessionEventsRepository.findManyBySessionId(sessionId)
  },

  async getSessionEventById(eventId: string, currentUser: CurrentUser) {
    const event = await sessionEventsRepository.findById(eventId)

    if (!event) {
      throw new SessionEventNotFoundError(eventId)
    }

    assertCanViewSession(event.session, currentUser)

    return event
  },

  async createSessionEvent(
    sessionId: string,
    data: CreateSessionEventInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageSessionEvents(currentUser)

    const session = await sessionEventsRepository.findSessionById(sessionId)

    if (!session) {
      throw new SessionEventSessionNotFoundError(sessionId)
    }

    assertSessionIsActive(session)

    return sessionEventsRepository.create(sessionId, data)
  },

  async updateSessionEvent(
    eventId: string,
    data: UpdateSessionEventInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageSessionEvents(currentUser)

    const event = await sessionEventsRepository.findById(eventId)

    if (!event) {
      throw new SessionEventNotFoundError(eventId)
    }

    assertSessionIsActive(event.session)

    return sessionEventsRepository.update(eventId, data)
  },

  async deleteSessionEvent(eventId: string, currentUser: CurrentUser) {
    assertCanManageSessionEvents(currentUser)

    const event = await sessionEventsRepository.findById(eventId)

    if (!event) {
      throw new SessionEventNotFoundError(eventId)
    }

    assertSessionIsActive(event.session)

    return sessionEventsRepository.delete(eventId)
  },
}