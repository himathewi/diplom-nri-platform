import type { CurrentUser } from '../../shared/types'

import {
  CustomParticipantItemNameRequiredError,
  InvalidItemQuantityError,
  InvalidSessionStatusForItemsError,
  ItemNotAllowedForSessionError,
  ItemNotFoundError,
  ParticipantItemForbiddenError,
  ParticipantItemNotFoundError,
  SessionAllowedItemAlreadyExistsError,
  SessionAllowedItemNotFoundError,
  SessionForbiddenError,
  SessionNotFoundError,
  SessionParticipantNotFoundError,
} from './items.errors'

import { itemsRepository } from './items.repository'

import type {
  AllowSessionItemInput,
  CreateCatalogItemInput,
  GrantParticipantItemInput,
  UpdateCatalogItemInput,
  UpdateParticipantItemInput,
  UpdateSessionAllowedItemInput,
} from './items.schemas'

function canManageCatalog(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

function canManageSession(
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  return currentUser.role === 'ADMIN'
    || (currentUser.role === 'MODERATOR' && session.moderatorId === currentUser.id)
}

function canViewSession(
  session: {
    moderatorId: string
    participants: { userId: string }[]
    team: { members: { userId: string }[] } | null
  },
  currentUser: CurrentUser,
) {
  if (canManageSession(session, currentUser)) {
    return true
  }

  if (currentUser.role !== 'PARTICIPANT') {
    return false
  }

  return (
    session.participants.some(
      (participant) => participant.userId === currentUser.id,
    )
    || Boolean(
      session.team?.members.some((member) => member.userId === currentUser.id),
    )
  )
}

function canViewParticipantItems(
  participant: {
    userId: string
    session: {
      moderatorId: string
    }
  },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN'
    || (currentUser.role === 'MODERATOR'
      && participant.session.moderatorId === currentUser.id)
    || participant.userId === currentUser.id
  )
}

function canManageParticipantItems(
  participant: {
    session: {
      moderatorId: string
    }
  },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN'
    || (currentUser.role === 'MODERATOR'
      && participant.session.moderatorId === currentUser.id)
  )
}

function assertPositiveQuantity(quantity: number) {
  if (quantity < 1) {
    throw new InvalidItemQuantityError(quantity)
  }
}

function assertSessionCanConfigureItems(session: {
  id: string
  status: string
}) {
  if (session.status !== 'PLANNED') {
    throw new InvalidSessionStatusForItemsError(session.id, session.status)
  }
}

function assertSessionCanGrantItems(session: {
  id: string
  status: string
}) {
  if (session.status !== 'PLANNED' && session.status !== 'ACTIVE') {
    throw new InvalidSessionStatusForItemsError(session.id, session.status)
  }
}

export const itemsService = {
  async getCatalogItems(currentUser: CurrentUser) {
    if (canManageCatalog(currentUser)) {
      return itemsRepository.findAllCatalogItems()
    }

    return itemsRepository.findPublicCatalogItems()
  },

  async getCatalogItemById(itemId: string, currentUser: CurrentUser) {
    const item = await itemsRepository.findCatalogItemById(itemId)

    if (!item || (!item.isActive && !canManageCatalog(currentUser))) {
      throw new ItemNotFoundError(itemId)
    }

    if (
      currentUser.role === 'PARTICIPANT'
      && (!item.isPublic || !item.isActive)
    ) {
      throw new ItemNotFoundError(itemId)
    }

    return item
  },

  async createCatalogItem(
    data: CreateCatalogItemInput,
    currentUser: CurrentUser,
  ) {
    if (!canManageCatalog(currentUser)) {
      throw new SessionForbiddenError()
    }

    return itemsRepository.createCatalogItem(data)
  },

  async updateCatalogItem(
    itemId: string,
    data: UpdateCatalogItemInput,
    currentUser: CurrentUser,
  ) {
    if (!canManageCatalog(currentUser)) {
      throw new SessionForbiddenError()
    }

    const item = await itemsRepository.findCatalogItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    return itemsRepository.updateCatalogItem(itemId, data)
  },

  async deleteCatalogItem(itemId: string, currentUser: CurrentUser) {
    if (!canManageCatalog(currentUser)) {
      throw new SessionForbiddenError()
    }

    const item = await itemsRepository.findCatalogItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    return itemsRepository.deactivateCatalogItem(itemId)
  },

  async getSessionItems(sessionId: string, currentUser: CurrentUser) {
    const session = await itemsRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canViewSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    const allowedItems = await itemsRepository.findSessionAllowedItems(sessionId)

    if (canManageSession(session, currentUser)) {
      return allowedItems
    }

    return allowedItems.filter((allowedItem) => allowedItem.isVisible)
  },

  async allowItemForSession(
    sessionId: string,
    data: AllowSessionItemInput,
    currentUser: CurrentUser,
  ) {
    const session = await itemsRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canManageSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    assertSessionCanConfigureItems(session)
    assertPositiveQuantity(data.quantity)

    const item = await itemsRepository.findCatalogItemById(data.itemId)

    if (!item || !item.isActive) {
      throw new ItemNotFoundError(data.itemId)
    }

    const existing = await itemsRepository.findSessionAllowedItem(
      sessionId,
      data.itemId,
    )

    if (existing) {
      throw new SessionAllowedItemAlreadyExistsError(sessionId, data.itemId)
    }

    return itemsRepository.createSessionAllowedItem(sessionId, data)
  },

  async updateSessionAllowedItem(
    sessionId: string,
    itemId: string,
    data: UpdateSessionAllowedItemInput,
    currentUser: CurrentUser,
  ) {
    const session = await itemsRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canManageSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    assertSessionCanConfigureItems(session)

    const allowedItem = await itemsRepository.findSessionAllowedItem(
      sessionId,
      itemId,
    )

    if (!allowedItem) {
      throw new SessionAllowedItemNotFoundError(sessionId, itemId)
    }

    if (data.quantity !== undefined) {
      assertPositiveQuantity(data.quantity)
    }

    return itemsRepository.updateSessionAllowedItem(sessionId, itemId, data)
  },

  async removeSessionAllowedItem(
    sessionId: string,
    itemId: string,
    currentUser: CurrentUser,
  ) {
    const session = await itemsRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canManageSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    assertSessionCanConfigureItems(session)

    const allowedItem = await itemsRepository.findSessionAllowedItem(
      sessionId,
      itemId,
    )

    if (!allowedItem) {
      throw new SessionAllowedItemNotFoundError(sessionId, itemId)
    }

    return itemsRepository.deleteSessionAllowedItem(sessionId, itemId)
  },

  async getParticipantItems(
    participantId: string,
    currentUser: CurrentUser,
  ) {
    const participant = await itemsRepository.findSessionParticipantById(
      participantId,
    )

    if (!participant) {
      throw new SessionParticipantNotFoundError(participantId)
    }

    if (!canViewParticipantItems(participant, currentUser)) {
      throw new ParticipantItemForbiddenError()
    }

    return itemsRepository.findParticipantItems(participantId)
  },

  async grantItemToParticipant(
    participantId: string,
    data: GrantParticipantItemInput,
    currentUser: CurrentUser,
  ) {
    const participant = await itemsRepository.findSessionParticipantById(
      participantId,
    )

    if (!participant) {
      throw new SessionParticipantNotFoundError(participantId)
    }

    if (!canManageParticipantItems(participant, currentUser)) {
      throw new ParticipantItemForbiddenError()
    }

    assertSessionCanGrantItems(participant.session)
    assertPositiveQuantity(data.quantity)

    let nameSnapshot = data.nameSnapshot

    if (data.itemId) {
      const item = await itemsRepository.findCatalogItemById(data.itemId)

      if (!item || !item.isActive) {
        throw new ItemNotFoundError(data.itemId)
      }

      const allowedItem = await itemsRepository.findSessionAllowedItem(
        participant.sessionId,
        data.itemId,
      )

      if (!allowedItem) {
        throw new ItemNotAllowedForSessionError(
          participant.sessionId,
          data.itemId,
        )
      }

      if (!nameSnapshot) {
        nameSnapshot = item.name
      }
    }

    if (!nameSnapshot) {
      throw new CustomParticipantItemNameRequiredError()
    }

    return itemsRepository.createParticipantItem(participantId, {
      ...data,
      nameSnapshot,
    })
  },

  async updateParticipantItem(
    participantItemId: string,
    data: UpdateParticipantItemInput,
    currentUser: CurrentUser,
  ) {
    const participantItem = await itemsRepository.findParticipantItemById(
      participantItemId,
    )

    if (!participantItem) {
      throw new ParticipantItemNotFoundError(participantItemId)
    }

    const isOwner =
      participantItem.sessionParticipant.userId === currentUser.id

    const canManage = canManageParticipantItems(
      participantItem.sessionParticipant,
      currentUser,
    )

    if (!isOwner && !canManage) {
      throw new ParticipantItemForbiddenError()
    }

    if (!canManage) {
      const allowedKeys = Object.keys(data)

      if (
        allowedKeys.some((key) => key !== 'isUsed')
      ) {
        throw new ParticipantItemForbiddenError()
      }
    }

    if (data.quantity !== undefined) {
      assertPositiveQuantity(data.quantity)
    }

    return itemsRepository.updateParticipantItem(participantItemId, data)
  },

  async deleteParticipantItem(
    participantItemId: string,
    currentUser: CurrentUser,
  ) {
    const participantItem = await itemsRepository.findParticipantItemById(
      participantItemId,
    )

    if (!participantItem) {
      throw new ParticipantItemNotFoundError(participantItemId)
    }

    if (!canManageParticipantItems(
      participantItem.sessionParticipant,
      currentUser,
    )) {
      throw new ParticipantItemForbiddenError()
    }

    return itemsRepository.deleteParticipantItem(participantItemId)
  },
}