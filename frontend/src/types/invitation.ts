import type { GameSession } from './session'
import type { User } from './user'

export type InvitationType = 'LINK' | 'CODE'

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'

export type SessionInvitation = {
  id: string
  sessionId: string
  invitedById: string
  invitedUserId: string | null

  type: InvitationType
  status: InvitationStatus

  expiresAt: string
  acceptedAt: string | null
  revokedAt: string | null
  attemptsCount: number

  createdAt: string
  updatedAt: string

  session?: GameSession
  invitedBy?: User
  invitedUser?: User | null
}

export type CreateSessionInvitationPayload = {
  type: InvitationType
  expiresAt?: string
}

export type CreateSessionInvitationResponse = {
  invitation: SessionInvitation
  inviteUrl?: string
  code?: string
}

export type AcceptInvitationByCodePayload = {
  code: string
}

export type InvitationPublicInfo = {
  id: string
  type: InvitationType
  status: InvitationStatus
  expiresAt: string
  session: {
    id: string
    status: string
    scenario?: {
      id: string
      title: string
      description: string
    }
    team?: {
      id: string
      name: string
      companyName: string | null
    } | null
  }
}