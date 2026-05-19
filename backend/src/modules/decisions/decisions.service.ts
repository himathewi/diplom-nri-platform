import { decisionsRepository } from './decisions.repository'
import type {
  CreateDecisionInput,
  EvaluateDecisionInput,
  UpdateDecisionInput,
} from './decisions.schemas'
import {
  DecisionCharacterNotFoundError,
  DecisionCharacterNotParticipantError,
  DecisionEventNotFoundError,
  DecisionEventSessionMismatchError,
  DecisionForbiddenError,
  DecisionNotFoundError,
  DecisionSessionNotActiveError,
  DecisionSessionNotFoundError,
} from './decisions.errors'
import type { CurrentUser } from '../../shared/types'

type SessionForAccess = Awaited<
  ReturnType<typeof decisionsRepository.findSessionById>
>

type DecisionForAccess = Awaited<ReturnType<typeof decisionsRepository.findById>>

function canManageDecisions(
  session: { moderatorId: string | null },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN' ||
    (currentUser.role === 'MODERATOR' && session.moderatorId === currentUser.id)
  )
}

function canViewAllDecisions(currentUser: CurrentUser) {
  return (
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MODERATOR' ||
    currentUser.role === 'EXPERT'
  )
}

function canViewSession(session: NonNullable<SessionForAccess>, currentUser: CurrentUser) {
  if (canViewAllDecisions(currentUser)) {
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
    throw new DecisionForbiddenError()
  }
}

function assertCanManageDecisions(
  session: { moderatorId: string | null },
  currentUser: CurrentUser,
) {
  if (!canManageDecisions(session, currentUser)) {
    throw new DecisionForbiddenError()
  }
}

function assertSessionIsActive(session: NonNullable<SessionForAccess>) {
  if (session.status !== 'ACTIVE') {
    throw new DecisionSessionNotActiveError(session.id)
  }
}

function canEditDecision(
  decision: NonNullable<DecisionForAccess>,
  currentUser: CurrentUser,
) {
  return canManageDecisions(decision.session, currentUser) || decision.userId === currentUser.id
}

function canViewDecision(
  decision: NonNullable<DecisionForAccess>,
  currentUser: CurrentUser,
) {
  if (canViewAllDecisions(currentUser)) {
    return true
  }

  if (decision.userId === currentUser.id) {
    return true
  }

  const isTeamMember = decision.session.team?.members.some(
    (member) => member.userId === currentUser.id,
  )

  const isParticipant = decision.session.participants.some(
    (participant) => participant.character.userId === currentUser.id,
  )

  return Boolean(isTeamMember || isParticipant)
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

async function validateCharacterBelongsToSession(
  sessionId: string,
  characterId?: string | null,
) {
  if (!characterId) {
    return null
  }

  const character = await decisionsRepository.findCharacterById(characterId)

  if (!character) {
    throw new DecisionCharacterNotFoundError(characterId)
  }

  const participant = await decisionsRepository.findParticipant(
    sessionId,
    characterId,
  )

  if (!participant) {
    throw new DecisionCharacterNotParticipantError(characterId)
  }

  return character
}

function assertCanUseCharacter(
  character: Awaited<ReturnType<typeof validateCharacterBelongsToSession>>,
  currentUser: CurrentUser,
  session: { moderatorId: string | null },
) {
  if (!character) {
    return
  }

  if (canManageDecisions(session, currentUser)) {
    return
  }

  if (character.userId !== currentUser.id) {
    throw new DecisionForbiddenError()
  }
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

    const character = await validateCharacterBelongsToSession(
      sessionId,
      data.characterId,
    )

    assertCanUseCharacter(character, currentUser, session)

    return decisionsRepository.create(sessionId, currentUser.id, data)
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

    const character = await validateCharacterBelongsToSession(
      decision.sessionId,
      data.characterId,
    )

    assertCanUseCharacter(character, currentUser, decision.session)

    return decisionsRepository.update(decisionId, data)
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
