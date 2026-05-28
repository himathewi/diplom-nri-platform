import { prisma } from '../../lib/prisma'

import type { CreateInvitationInput } from './invitations.schemas'

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

const invitationInclude = {
  session: {
    include: {
      scenario: true,
      team: true,
      moderator: {
        select: safeUserSelect,
      },
    },
  },
  invitedBy: {
    select: safeUserSelect,
  },
  invitedUser: {
    select: safeUserSelect,
  },
} as const

export const invitationsRepository = {
  findSessionForAccess(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        status: true,
        moderatorId: true,
      },
    })
  },

  findSessionInvitations(sessionId: string) {
    return prisma.sessionInvitation.findMany({
      where: {
        sessionId,
      },
      include: invitationInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findInvitationById(invitationId: string) {
    return prisma.sessionInvitation.findUnique({
      where: {
        id: invitationId,
      },
      include: invitationInclude,
    })
  },

  findInvitationByTokenHash(tokenHash: string) {
    return prisma.sessionInvitation.findUnique({
      where: {
        tokenHash,
      },
      include: invitationInclude,
    })
  },

  findInvitationByCodeHash(codeHash: string) {
    return prisma.sessionInvitation.findUnique({
      where: {
        codeHash,
      },
      include: invitationInclude,
    })
  },

  findParticipant(sessionId: string, userId: string) {
    return prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    })
  },

  createInvitation(
    sessionId: string,
    invitedById: string,
    data: CreateInvitationInput,
    hashes: {
      tokenHash?: string
      codeHash?: string
    },
  ) {
    const expiresAt = new Date(
      Date.now() + data.expiresInHours * 60 * 60 * 1000,
    )

    return prisma.sessionInvitation.create({
      data: {
        sessionId,
        invitedById,
        invitedUserId: data.invitedUserId ?? null,
        type: data.type,
        tokenHash: hashes.tokenHash ?? null,
        codeHash: hashes.codeHash ?? null,
        expiresAt,
      },
      include: invitationInclude,
    })
  },

  markExpired(invitationId: string) {
    return prisma.sessionInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: 'EXPIRED',
      },
      include: invitationInclude,
    })
  },

  revokeInvitation(invitationId: string) {
    return prisma.sessionInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
      include: invitationInclude,
    })
  },

  acceptInvitation(invitationId: string, sessionId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const participant = await tx.sessionParticipant.upsert({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
        update: {},
        create: {
          sessionId,
          userId,
        },
        include: {
          user: {
            select: safeUserSelect,
          },
          character: {
            include: {
              roleClass: true,
              stats: true,
            },
          },
        },
      })

      const invitation = await tx.sessionInvitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          invitedUserId: userId,
        },
        include: invitationInclude,
      })

      return {
        invitation,
        participant,
      }
    })
  },
}
