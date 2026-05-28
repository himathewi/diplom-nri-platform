import { createHash, randomBytes, randomInt } from 'node:crypto'

import { InvitationType } from '@prisma/client'

import type { CurrentUser } from '../../shared/types'

import {
  InvitationAlreadyUsedError,
  InvitationCodeGenerationError,
  InvitationExpiredError,
  InvitationForbiddenError,
  InvitationInvalidSessionStatusError,
  InvitationNotFoundError,
  InvitationParticipantAlreadyExistsError,
  InvitationRevokedError,
  InvitationSessionNotFoundError,
  InvitationUserMismatchError,
} from './invitations.errors'

import { invitationsRepository } from './invitations.repository'

import type { CreateInvitationInput } from './invitations.schemas'

function canManageSession(
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  if (currentUser.role === 'ADMIN') {
    return true
  }

  return currentUser.role === 'MODERATOR' && session.moderatorId === currentUser.id
}

function assertCanManageSession(
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  if (!canManageSession(session, currentUser)) {
    throw new InvitationForbiddenError()
  }
}

function assertSessionIsPlanned(session: { id: string; status: string }) {
  if (session.status !== 'PLANNED') {
    throw new InvitationInvalidSessionStatusError(session.id, session.status)
  }
}

function hashSecret(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function generateToken() {
  return randomBytes(32).toString('hex')
}

function generateSixDigitCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

function getFrontendBaseUrl() {
  return (
    process.env.FRONTEND_URL
    ?? process.env.CORS_ORIGIN
    ?? 'http://localhost:5173'
  ).replace(/\/$/, '')
}

function buildInvitationLink(token: string) {
  return `${getFrontendBaseUrl()}/invitations/accept?token=${token}`
}

function toInvitationDto(invitation: {
  id: string
  sessionId: string
  invitedById: string
  invitedUserId: string | null
  type: string
  status: string
  attemptsCount: number
  expiresAt: Date
  acceptedAt: Date | null
  revokedAt: Date | null
  createdAt: Date
  updatedAt: Date
  session?: unknown
  invitedBy?: unknown
  invitedUser?: unknown
}) {
  return {
    id: invitation.id,
    sessionId: invitation.sessionId,
    invitedById: invitation.invitedById,
    invitedUserId: invitation.invitedUserId,
    type: invitation.type,
    status: invitation.status,
    attemptsCount: invitation.attemptsCount,
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt,
    revokedAt: invitation.revokedAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
    session: invitation.session,
    invitedBy: invitation.invitedBy,
    invitedUser: invitation.invitedUser,
  }
}

async function findPendingInvitationByToken(token: string) {
  const invitation = await invitationsRepository.findInvitationByTokenHash(
    hashSecret(token),
  )

  if (!invitation) {
    throw new InvitationNotFoundError()
  }

  return invitation
}

async function findPendingInvitationByCode(code: string) {
  const invitation = await invitationsRepository.findInvitationByCodeHash(
    hashSecret(code),
  )

  if (!invitation) {
    throw new InvitationNotFoundError()
  }

  return invitation
}

async function assertInvitationCanBeAccepted(
  invitation: {
    id: string
    status: string
    expiresAt: Date
    invitedUserId: string | null
    sessionId: string
    session: {
      id: string
      status: string
    }
  },
  currentUser: CurrentUser,
) {
  if (invitation.status === 'ACCEPTED') {
    throw new InvitationAlreadyUsedError()
  }

  if (invitation.status === 'REVOKED') {
    throw new InvitationRevokedError()
  }

  if (invitation.status === 'EXPIRED') {
    throw new InvitationExpiredError()
  }

  if (invitation.expiresAt.getTime() < Date.now()) {
    await invitationsRepository.markExpired(invitation.id)
    throw new InvitationExpiredError()
  }

  if (
    invitation.invitedUserId !== null
    && invitation.invitedUserId !== currentUser.id
  ) {
    throw new InvitationUserMismatchError()
  }

  assertSessionIsPlanned(invitation.session)

  const existingParticipant = await invitationsRepository.findParticipant(
    invitation.sessionId,
    currentUser.id,
  )

  if (existingParticipant) {
    throw new InvitationParticipantAlreadyExistsError()
  }
}

async function generateUniqueCodeHash() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateSixDigitCode()
    const codeHash = hashSecret(code)

    const existingInvitation = await invitationsRepository.findInvitationByCodeHash(
      codeHash,
    )

    if (!existingInvitation) {
      return {
        code,
        codeHash,
      }
    }
  }

  throw new InvitationCodeGenerationError()
}

export const invitationsService = {
  async getSessionInvitations(sessionId: string, currentUser: CurrentUser) {
    const session = await invitationsRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new InvitationSessionNotFoundError(sessionId)
    }

    assertCanManageSession(session, currentUser)

    const invitations = await invitationsRepository.findSessionInvitations(
      sessionId,
    )

    return invitations.map(toInvitationDto)
  },

  async createInvitation(
    sessionId: string,
    data: CreateInvitationInput,
    currentUser: CurrentUser,
  ) {
    const session = await invitationsRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new InvitationSessionNotFoundError(sessionId)
    }

    assertCanManageSession(session, currentUser)
    assertSessionIsPlanned(session)

    if (data.type === InvitationType.CODE) {
      const { code, codeHash } = await generateUniqueCodeHash()

      const invitation = await invitationsRepository.createInvitation(
        sessionId,
        currentUser.id,
        data,
        {
          codeHash,
        },
      )

      return {
        invitation: toInvitationDto(invitation),
        code,
      }
    }

    const token = generateToken()
    const tokenHash = hashSecret(token)

    const invitation = await invitationsRepository.createInvitation(
      sessionId,
      currentUser.id,
      data,
      {
        tokenHash,
      },
    )

    return {
      invitation: toInvitationDto(invitation),
      token,
      inviteLink: buildInvitationLink(token),
    }
  },

  async getInvitationByToken(token: string) {
    const invitation = await findPendingInvitationByToken(token)

    if (invitation.expiresAt.getTime() < Date.now()) {
      await invitationsRepository.markExpired(invitation.id)
      throw new InvitationExpiredError()
    }

    return toInvitationDto(invitation)
  },

  async acceptInvitationByToken(token: string, currentUser: CurrentUser) {
    const invitation = await findPendingInvitationByToken(token)

    await assertInvitationCanBeAccepted(invitation, currentUser)

    const result = await invitationsRepository.acceptInvitation(
      invitation.id,
      invitation.sessionId,
      currentUser.id,
    )

    return {
      invitation: toInvitationDto(result.invitation),
      participant: result.participant,
    }
  },

  async acceptInvitationByCode(code: string, currentUser: CurrentUser) {
    const invitation = await findPendingInvitationByCode(code)

    await assertInvitationCanBeAccepted(invitation, currentUser)

    const result = await invitationsRepository.acceptInvitation(
      invitation.id,
      invitation.sessionId,
      currentUser.id,
    )

    return {
      invitation: toInvitationDto(result.invitation),
      participant: result.participant,
    }
  },

  async revokeInvitation(invitationId: string, currentUser: CurrentUser) {
    const invitation = await invitationsRepository.findInvitationById(
      invitationId,
    )

    if (!invitation) {
      throw new InvitationNotFoundError()
    }

    assertCanManageSession(invitation.session, currentUser)

    if (invitation.status === 'ACCEPTED') {
      throw new InvitationAlreadyUsedError()
    }

    if (invitation.status === 'REVOKED') {
      throw new InvitationRevokedError()
    }

    const revokedInvitation = await invitationsRepository.revokeInvitation(
      invitationId,
    )

    return toInvitationDto(revokedInvitation)
  },
}