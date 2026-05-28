import { prisma } from '../../lib/prisma'

import type {
  AllowSessionItemInput,
  CreateCatalogItemInput,
  GrantParticipantItemInput,
  UpdateCatalogItemInput,
  UpdateParticipantItemInput,
  UpdateSessionAllowedItemInput,
} from './items.schemas'

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

const sessionForAccessInclude = {
  team: {
    include: {
      members: true,
    },
  },
  participants: true,
} as const

const sessionAllowedItemInclude = {
  item: true,
  session: true,
} as const

const participantItemInclude = {
  item: true,
  sessionParticipant: {
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
      session: true,
    },
  },
} as const

const sessionParticipantInclude = {
  user: {
    select: safeUserSelect,
  },
  character: {
    include: {
      roleClass: true,
      stats: true,
    },
  },
  session: {
    include: sessionForAccessInclude,
  },
} as const

export const itemsRepository = {
  findAllCatalogItems() {
    return prisma.item.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  },

  findActiveCatalogItems() {
    return prisma.item.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },

  findPublicCatalogItems() {
    return prisma.item.findMany({
      where: {
        isActive: true,
        isPublic: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },

  findCatalogItemById(itemId: string) {
    return prisma.item.findUnique({
      where: {
        id: itemId,
      },
    })
  },

  createCatalogItem(data: CreateCatalogItemInput) {
    return prisma.item.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description ?? null,
        isPublic: data.isPublic,
        isActive: data.isActive,
      },
    })
  },

  updateCatalogItem(itemId: string, data: UpdateCatalogItemInput) {
    return prisma.item.update({
      where: {
        id: itemId,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.type !== undefined && {
          type: data.type,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.isPublic !== undefined && {
          isPublic: data.isPublic,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
    })
  },

  deactivateCatalogItem(itemId: string) {
    return prisma.item.update({
      where: {
        id: itemId,
      },
      data: {
        isActive: false,
      },
    })
  },

  findSessionForAccess(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      include: sessionForAccessInclude,
    })
  },

  findSessionAllowedItems(sessionId: string) {
    return prisma.sessionAllowedItem.findMany({
      where: {
        sessionId,
      },
      include: sessionAllowedItemInclude,
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findSessionAllowedItem(sessionId: string, itemId: string) {
    return prisma.sessionAllowedItem.findUnique({
      where: {
        sessionId_itemId: {
          sessionId,
          itemId,
        },
      },
      include: sessionAllowedItemInclude,
    })
  },

  createSessionAllowedItem(sessionId: string, data: AllowSessionItemInput) {
    return prisma.sessionAllowedItem.create({
      data: {
        sessionId,
        itemId: data.itemId,
        quantity: data.quantity,
        isVisible: data.isVisible,
        notes: data.notes ?? null,
      },
      include: sessionAllowedItemInclude,
    })
  },

  updateSessionAllowedItem(
    sessionId: string,
    itemId: string,
    data: UpdateSessionAllowedItemInput,
  ) {
    return prisma.sessionAllowedItem.update({
      where: {
        sessionId_itemId: {
          sessionId,
          itemId,
        },
      },
      data: {
        ...(data.quantity !== undefined && {
          quantity: data.quantity,
        }),
        ...(data.isVisible !== undefined && {
          isVisible: data.isVisible,
        }),
        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
      },
      include: sessionAllowedItemInclude,
    })
  },

  deleteSessionAllowedItem(sessionId: string, itemId: string) {
    return prisma.sessionAllowedItem.delete({
      where: {
        sessionId_itemId: {
          sessionId,
          itemId,
        },
      },
      include: sessionAllowedItemInclude,
    })
  },

  findSessionParticipantById(participantId: string) {
    return prisma.sessionParticipant.findUnique({
      where: {
        id: participantId,
      },
      include: sessionParticipantInclude,
    })
  },

  findParticipantItems(sessionParticipantId: string) {
    return prisma.participantItem.findMany({
      where: {
        sessionParticipantId,
      },
      include: participantItemInclude,
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findParticipantItemsByItemIds(
    sessionParticipantId: string,
    itemIds: string[],
  ) {
    return prisma.participantItem.findMany({
      where: {
        sessionParticipantId,
        itemId: {
          in: itemIds,
        },
      },
      include: participantItemInclude,
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findParticipantItemQuantitiesByItemIds(
    sessionParticipantId: string,
    itemIds: string[],
  ) {
    return prisma.participantItem.groupBy({
      by: ['itemId'],
      where: {
        sessionParticipantId,
        itemId: {
          in: itemIds,
        },
      },
      _sum: {
        quantity: true,
      },
    })
  },

  findParticipantItemById(participantItemId: string) {
    return prisma.participantItem.findUnique({
      where: {
        id: participantItemId,
      },
      include: participantItemInclude,
    })
  },

  createParticipantItem(
    sessionParticipantId: string,
    data: GrantParticipantItemInput & { nameSnapshot: string },
  ) {
    return prisma.participantItem.create({
      data: {
        sessionParticipantId,
        itemId: data.itemId ?? null,
        nameSnapshot: data.nameSnapshot,
        quantity: data.quantity,
        notes: data.notes ?? null,
      },
      include: participantItemInclude,
    })
  },

  updateParticipantItem(
    participantItemId: string,
    data: UpdateParticipantItemInput,
  ) {
    return prisma.participantItem.update({
      where: {
        id: participantItemId,
      },
      data: {
        ...(data.nameSnapshot !== undefined && {
          nameSnapshot: data.nameSnapshot,
        }),
        ...(data.quantity !== undefined && {
          quantity: data.quantity,
        }),
        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
        ...(data.isUsed !== undefined && {
          isUsed: data.isUsed,
        }),
      },
      include: participantItemInclude,
    })
  },

  deleteParticipantItem(participantItemId: string) {
    return prisma.participantItem.delete({
      where: {
        id: participantItemId,
      },
      include: participantItemInclude,
    })
  },
}