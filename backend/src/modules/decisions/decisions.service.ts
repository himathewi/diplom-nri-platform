import type { CurrentUser } from '../../shared/types'
import {
  DecisionEventNotFoundError,
  DecisionEventSessionMismatchError,
  DecisionForbiddenError,
  DecisionNotFoundError,
  DecisionSessionNotActiveError,
  DecisionSessionNotFoundError,
  DecisionSessionParticipantMismatchError,
  DecisionSessionParticipantNotFoundError,
  DecisionSessionTaskHiddenError,
  DecisionSessionTaskMismatchError,
  DecisionSessionTaskNotFoundError,
  DecisionUserNotSessionParticipantError,
} from './decisions.errors'
import { decisionsRepository } from './decisions.repository'
import type {
  CreateDecisionInput,
  EvaluateDecisionInput,
  UpdateDecisionInput,
} from './decisions.schemas'

type SessionForAccess = Awaited<
  ReturnType<typeof decisionsRepository.findSessionById>
>

type DecisionForAccess = Awaited<
  ReturnType<typeof decisionsRepository.findById>
>

function canManageDecisions(
  session: { moderatorId: string | null },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN' ||
    (currentUser.role === 'MODERATOR' && session.moderatorId === currentUser.id)
  )
}

function assertCanManageDecisions(
  session: { moderatorId: string | null },
  currentUser: CurrentUser,
) {
  if (!canManageDecisions(session, currentUser)) {
    throw new DecisionForbiddenError()
  }
}

function isSessionParticipant(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  return session.participants.some(
    (participant) => participant.userId === currentUser.id,
  )
}

function isTeamMember(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  return (
    session.team?.members.some((member) => member.userId === currentUser.id) ??
    false
  )
}

function canViewSession(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  if (canManageDecisions(session, currentUser)) {
    return true
  }

  return isSessionParticipant(session, currentUser) || isTeamMember(session, currentUser)
}

function assertCanViewSession(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  if (!canViewSession(session, currentUser)) {
    throw new DecisionForbiddenError()
  }
}

function assertSessionIsActive(session: { id: string; status: string }) {
  if (session.status !== 'ACTIVE') {
    throw new DecisionSessionNotActiveError(session.id)
  }
}

function canViewDecision(
  decision: NonNullable<DecisionForAccess>,
  currentUser: CurrentUser,
) {
  if (canManageDecisions(decision.session, currentUser)) {
    return true
  }

  if (decision.userId === currentUser.id) {
    return true
  }

  if (decision.sessionParticipant?.userId === currentUser.id) {
    return true
  }

  return isSessionParticipant(decision.session, currentUser)
}

function canEditDecision(
  decision: NonNullable<DecisionForAccess>,
  currentUser: CurrentUser,
) {
  if (canManageDecisions(decision.session, currentUser)) {
    return true
  }

  if (decision.userId === currentUser.id) {
    return true
  }

  return decision.sessionParticipant?.userId === currentUser.id
}

async function validateEventBelongsToSession(
  sessionId: string,
  eventId?: string | null,
) {
  if (!eventId) {
    return null
  }

  const event = await decisionsRepository.findEventById(eventId)

  if (!event) {
    throw new DecisionEventNotFoundError(eventId)
  }

  if (event.sessionId !== sessionId) {
    throw new DecisionEventSessionMismatchError()
  }

  return event
}

async function validateSessionTaskBelongsToSession(
  sessionId: string,
  sessionTaskId: string | null | undefined,
  currentUser: CurrentUser,
) {
  if (!sessionTaskId) {
    return null
  }

  const sessionTask = await decisionsRepository.findSessionTaskById(sessionTaskId)

  if (!sessionTask) {
    throw new DecisionSessionTaskNotFoundError(sessionTaskId)
  }

  if (sessionTask.sessionId !== sessionId) {
    throw new DecisionSessionTaskMismatchError()
  }

  if (
    currentUser.role === 'PARTICIPANT' &&
    !sessionTask.isVisibleToParticipants
  ) {
    throw new DecisionSessionTaskHiddenError()
  }

  return sessionTask
}

async function validateParticipantBelongsToSession(
  sessionId: string,
  participantId: string,
) {
  const participant = await decisionsRepository.findParticipantById(participantId)

  if (!participant) {
    throw new DecisionSessionParticipantNotFoundError(participantId)
  }

  if (participant.sessionId !== sessionId) {
    throw new DecisionSessionParticipantMismatchError()
  }

  return participant
}

async function resolveParticipantForCreate(
  sessionId: string,
  data: CreateDecisionInput,
  currentUser: CurrentUser,
  session: { moderatorId: string | null },
) {
  if (canManageDecisions(session, currentUser)) {
    if (!data.sessionParticipantId) {
      return null
    }

    const participant = await validateParticipantBelongsToSession(
      sessionId,
      data.sessionParticipantId,
    )

    return participant.id
  }

  const participant = await decisionsRepository.findParticipantBySessionAndUser(
    sessionId,
    currentUser.id,
  )

  if (!participant) {
    throw new DecisionUserNotSessionParticipantError()
  }

  if (
    data.sessionParticipantId &&
    data.sessionParticipantId !== participant.id
  ) {
    throw new DecisionForbiddenError()
  }

  return participant.id
}

async function resolveParticipantForUpdate(
  sessionId: string,
  data: UpdateDecisionInput,
  currentUser: CurrentUser,
  session: { moderatorId: string | null },
) {
  if (typeof data.sessionParticipantId === 'undefined') {
    return undefined
  }

  if (canManageDecisions(session, currentUser)) {
    if (data.sessionParticipantId === null) {
      return null
    }

    const participant = await validateParticipantBelongsToSession(
      sessionId,
      data.sessionParticipantId,
    )

    return participant.id
  }

  if (data.sessionParticipantId === null) {
    throw new DecisionForbiddenError()
  }

  const participant = await decisionsRepository.findParticipantBySessionAndUser(
    sessionId,
    currentUser.id,
  )

  if (!participant) {
    throw new DecisionUserNotSessionParticipantError()
  }

  if (data.sessionParticipantId !== participant.id) {
    throw new DecisionForbiddenError()
  }

  return participant.id
}

export const decisionsService = {
  async getSessionDecisions(sessionId: string, currentUser: CurrentUser) {
    const session = await decisionsRepository.findSessionById(sessionId)

    if (!session) {
      throw new DecisionSessionNotFoundError(sessionId)
    }

    assertCanViewSession(session, currentUser)

    return decisionsRepository.findManyBySessionId(sessionId)
  },

  async getDecisionById(decisionId: string, currentUser: CurrentUser) {
    const decision = await decisionsRepository.findById(decisionId)

    if (!decision) {
      throw new DecisionNotFoundError(decisionId)
    }

    if (!canViewDecision(decision, currentUser)) {
      throw new DecisionForbiddenError()
    }

    return decision
  },

  async createDecision(
    sessionId: string,
    data: CreateDecisionInput,
    currentUser: CurrentUser,
  ) {
    const session = await decisionsRepository.findSessionById(sessionId)

    if (!session) {
      throw new DecisionSessionNotFoundError(sessionId)
    }

    assertCanViewSession(session, currentUser)
    assertSessionIsActive(session)

    await validateEventBelongsToSession(sessionId, data.eventId)
    await validateSessionTaskBelongsToSession(
      sessionId,
      data.sessionTaskId,
      currentUser,
    )

    const sessionParticipantId = await resolveParticipantForCreate(
      sessionId,
      data,
      currentUser,
      session,
    )

    return decisionsRepository.create(
      sessionId,
      currentUser.id,
      data,
      sessionParticipantId,
    )
  },

  async updateDecision(
    decisionId: string,
    data: UpdateDecisionInput,
    currentUser: CurrentUser,
  ) {
    const decision = await decisionsRepository.findById(decisionId)

    if (!decision) {
      throw new DecisionNotFoundError(decisionId)
    }

    if (!canEditDecision(decision, currentUser)) {
      throw new DecisionForbiddenError()
    }

    assertSessionIsActive(decision.session)

    await validateEventBelongsToSession(decision.sessionId, data.eventId)
    await validateSessionTaskBelongsToSession(
      decision.sessionId,
      data.sessionTaskId,
      currentUser,
    )

    const sessionParticipantId = await resolveParticipantForUpdate(
      decision.sessionId,
      data,
      currentUser,
      decision.session,
    )

    return decisionsRepository.update(decisionId, data, sessionParticipantId)
  },

  async evaluateDecision(
    decisionId: string,
    data: EvaluateDecisionInput,
    currentUser: CurrentUser,
  ) {
    const decision = await decisionsRepository.findById(decisionId)

    if (!decision) {
      throw new DecisionNotFoundError(decisionId)
    }

    assertCanManageDecisions(decision.session, currentUser)
    assertSessionIsActive(decision.session)

    return decisionsRepository.evaluate(decisionId, data)
  },

  async deleteDecision(decisionId: string, currentUser: CurrentUser) {
    const decision = await decisionsRepository.findById(decisionId)

    if (!decision) {
      throw new DecisionNotFoundError(decisionId)
    }

    if (!canEditDecision(decision, currentUser)) {
      throw new DecisionForbiddenError()
    }

    assertSessionIsActive(decision.session)

    return decisionsRepository.delete(decisionId)
  },
}