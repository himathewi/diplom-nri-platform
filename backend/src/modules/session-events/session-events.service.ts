import type { CurrentUser } from '../../shared/types'

import {
  SessionEventForbiddenError,
  SessionEventNotFoundError,
  SessionEventSessionAlreadyFinishedError,
  SessionEventSessionNotActiveError,
  SessionEventSessionNotFoundError,
} from './session-events.errors'

import { sessionEventsRepository } from './session-events.repository'

import type {
  CreateSessionEventInput,
  UpdateSessionEventInput,
} from './session-events.schemas'

type SessionForAccess = Awaited<
  ReturnType<typeof sessionEventsRepository.findSessionById>
>

function canManageSessionEvents(
  session: { moderatorId: string },
  currentUser: CurrentUser,
) {
  if (currentUser.role === 'ADMIN') {
    return true
  }

  return currentUser.role === 'MODERATOR' && session.moderatorId === currentUser.id
}

function canViewAllSessionEvents(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN'
}

function canViewSession(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  if (
    canViewAllSessionEvents(currentUser) ||
    canManageSessionEvents(session, currentUser)
  ) {
    return true
  }

  const isTeamMember = Boolean(
    session.team?.members.some((member) => member.userId === currentUser.id),
  )

  const isParticipant = session.participants.some(
    (participant) => participant.userId === currentUser.id,
  )

  return isTeamMember || isParticipant
}

function assertCanViewSession(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  if (!canViewSession(session, currentUser)) {
    throw new SessionEventForbiddenError()
  }
}

function assertCanManageSessionEvents(
  session: { moderatorId: string },
  currentUser: CurrentUser,
) {
  if (!canManageSessionEvents(session, currentUser)) {
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
    const session = await sessionEventsRepository.findSessionById(sessionId)

    if (!session) {
      throw new SessionEventSessionNotFoundError(sessionId)
    }

    assertCanManageSessionEvents(session, currentUser)
    assertSessionIsActive(session)

    return sessionEventsRepository.create(sessionId, data)
  },

  async updateSessionEvent(
    eventId: string,
    data: UpdateSessionEventInput,
    currentUser: CurrentUser,
  ) {
    const event = await sessionEventsRepository.findById(eventId)

    if (!event) {
      throw new SessionEventNotFoundError(eventId)
    }

    assertCanManageSessionEvents(event.session, currentUser)
    assertSessionIsActive(event.session)

    return sessionEventsRepository.update(eventId, data)
  },

  async deleteSessionEvent(eventId: string, currentUser: CurrentUser) {
    const event = await sessionEventsRepository.findById(eventId)

    if (!event) {
      throw new SessionEventNotFoundError(eventId)
    }

    assertCanManageSessionEvents(event.session, currentUser)
    assertSessionIsActive(event.session)

    return sessionEventsRepository.delete(eventId)
  },
}
