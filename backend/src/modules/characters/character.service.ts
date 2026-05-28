import type { CurrentUser } from '../../shared/types'

import { getAbilityModifier } from '../calculation/stats.rules'

import { toCharacterProfileDto } from './character.mappers'

import { characterRepository } from './character.repository'

import type {
  CreateCharacterInput,
  SessionCharacterCreationInput,
  UpdateCharacterInput,
} from './character.schemas'

import {
  CharacterAlreadyExistsForSessionError,
  CharacterForbiddenError,
  CharacterNotFoundError,
  CurrentFatigueExceedsLimitError,
  InvalidSessionStatusForCharacterCreationError,
  RoleClassNotAllowedError,
  RoleClassNotFoundError,
  SessionNotFoundError,
} from './errors'

function canManageAnyCharacter(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

function canAccessCharacter(
  character: { userId: string },
  currentUser: CurrentUser,
) {
  return canManageAnyCharacter(currentUser) || character.userId === currentUser.id
}

function canUseSessionForProfile(
  session: {
    moderatorId: string
    team: { members: { userId: string }[] } | null
    participants: { userId: string }[]
  },
  currentUser: CurrentUser,
) {
  if (currentUser.role === 'ADMIN') {
    return true
  }

  if (
    currentUser.role === 'MODERATOR'
    && session.moderatorId === currentUser.id
  ) {
    return true
  }

  if (currentUser.role !== 'PARTICIPANT') {
    return false
  }

  const isSessionParticipant = session.participants.some(
    (participant) => participant.userId === currentUser.id,
  )

  const isTeamMember = Boolean(
    session.team?.members.some((member) => member.userId === currentUser.id),
  )

  return isSessionParticipant || isTeamMember
}

function calculateFatigueLimitFromConstitution(constitution: number) {
  return Math.max(3, 3 + getAbilityModifier(constitution))
}

async function assertCanAccessCharacter(
  characterId: string,
  currentUser: CurrentUser,
) {
  const character = await characterRepository.findAccessById(characterId)

  if (!character) {
    throw new CharacterNotFoundError(characterId)
  }

  if (!canAccessCharacter(character, currentUser)) {
    throw new CharacterForbiddenError(characterId)
  }

  return character
}

function assertSessionPlannedForCharacterCreation(session: {
  id: string
  status: string
}) {
  if (session.status !== 'PLANNED') {
    throw new InvalidSessionStatusForCharacterCreationError(
      session.id,
      session.status,
    )
  }
}

function assertRoleClassAllowed(
  session: {
    id: string
    allowedRoleClasses: { roleClassId: string }[]
  },
  roleClassId: string,
) {
  const isAllowed = session.allowedRoleClasses.some(
    (allowedRoleClass) => allowedRoleClass.roleClassId === roleClassId,
  )

  if (!isAllowed) {
    throw new RoleClassNotAllowedError(session.id, roleClassId)
  }
}

async function assertRoleClassAllowedForCharacterSessions(
  characterId: string,
  roleClassId: string,
) {
  const character = await characterRepository.findByIdForRules(characterId)

  if (!character) {
    throw new CharacterNotFoundError(characterId)
  }

  const roleClass = await characterRepository.findRoleClassById(roleClassId)

  if (!roleClass) {
    throw new RoleClassNotFoundError(roleClassId)
  }

  const sessionIds = character.sessionParticipants.map(
    (participant) => participant.sessionId,
  )

  if (sessionIds.length === 0) {
    return character
  }

  const allowedCount =
    await characterRepository.countAllowedRoleClassForSessions(
      sessionIds,
      roleClassId,
    )

  if (allowedCount !== sessionIds.length) {
    throw new RoleClassNotAllowedError(sessionIds[0], roleClassId)
  }

  return character
}

export const characterService = {
  async getCharacters(currentUser: CurrentUser) {
    const characters = canManageAnyCharacter(currentUser)
      ? await characterRepository.findAll()
      : await characterRepository.findAllByUserId(currentUser.id)

    return characters.map(toCharacterProfileDto)
  },

  async getCharacterById(id: string, currentUser: CurrentUser) {
    await assertCanAccessCharacter(id, currentUser)

    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return toCharacterProfileDto(character)
  },

  async getCharacterOptions(sessionId: string, currentUser: CurrentUser) {
    const session = await characterRepository.findSessionForCharacterOptions(
      sessionId,
    )

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canUseSessionForProfile(session, currentUser)) {
      throw new CharacterForbiddenError()
    }

    const canSeeHiddenItems = canManageAnyCharacter(currentUser)

    return {
      session: {
        id: session.id,
        status: session.status,
        scenario: session.scenario,
      },
      roleClasses: session.allowedRoleClasses.map(
        (allowedRoleClass) => allowedRoleClass.roleClass,
      ),
      startingItems: session.allowedItems
        .filter((allowedItem) => canSeeHiddenItems || allowedItem.isVisible)
        .map((allowedItem) => ({
          id: allowedItem.item.id,
          name: allowedItem.item.name,
          type: allowedItem.item.type,
          description: allowedItem.item.description,
          quantity: allowedItem.quantity,
          notes: canSeeHiddenItems ? allowedItem.notes : null,
        })),
      creationRules: {
        oneProfilePerSession: true,
        fatigueLimitFormula: 'max(3, 3 + constitutionModifier)',
        modifierFormula: 'floor((value - 10) / 2)',
        allowedStats: [
          'strength',
          'dexterity',
          'constitution',
          'intelligence',
          'wisdom',
          'charisma',
        ],
      },
    }
  },

  async createCharacter(data: CreateCharacterInput, currentUser: CurrentUser) {
    const { sessionId, ...characterData } = data

    return this.createCharacterForSession(
      sessionId,
      characterData,
      currentUser,
    )
  },

  async createCharacterForSession(
    sessionId: string,
    data: SessionCharacterCreationInput,
    currentUser: CurrentUser,
  ) {
    const session = await characterRepository.findSessionForCharacterOptions(
      sessionId,
    )

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canUseSessionForProfile(session, currentUser)) {
      throw new CharacterForbiddenError()
    }

    assertSessionPlannedForCharacterCreation(session)

    const roleClass = await characterRepository.findRoleClassById(
      data.roleClassId,
    )

    if (!roleClass) {
      throw new RoleClassNotFoundError(data.roleClassId)
    }

    assertRoleClassAllowed(session, data.roleClassId)

    const existingParticipant =
      await characterRepository.findSessionParticipantBySessionAndUser(
        sessionId,
        currentUser.id,
      )

    if (existingParticipant?.characterId) {
      throw new CharacterAlreadyExistsForSessionError(sessionId, currentUser.id)
    }

    const constitution = data.baseStats?.constitution ?? 10
    const fatigueLimit = calculateFatigueLimitFromConstitution(constitution)

    const character = await characterRepository.createForSession({
      ...data,
      userId: currentUser.id,
      sessionId,
      fatigueLimit,
    })

    return toCharacterProfileDto(character)
  },

  async updateCharacter(
    id: string,
    data: UpdateCharacterInput,
    currentUser: CurrentUser,
  ) {
    await assertCanAccessCharacter(id, currentUser)

    const character = await characterRepository.findByIdForRules(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (data.roleClassId) {
      await assertRoleClassAllowedForCharacterSessions(id, data.roleClassId)
    }

    const nextConstitution =
      data.baseStats?.constitution
      ?? character.stats?.constitution
      ?? 10

    const nextFatigueLimit = data.baseStats?.constitution !== undefined
      ? calculateFatigueLimitFromConstitution(nextConstitution)
      : character.fatigueLimit

    const nextCurrentFatigue =
      data.currentFatigue ?? character.currentFatigue

    if (nextCurrentFatigue > nextFatigueLimit) {
      throw new CurrentFatigueExceedsLimitError(
        nextCurrentFatigue,
        nextFatigueLimit,
      )
    }

    const updatedCharacter = await characterRepository.update(id, {
      ...data,
      fatigueLimit: nextFatigueLimit,
    })

    return toCharacterProfileDto(updatedCharacter)
  },

  async deleteCharacter(id: string, currentUser: CurrentUser) {
    await assertCanAccessCharacter(id, currentUser)

    const existingCharacter = await characterRepository.findById(id)

    if (!existingCharacter) {
      throw new CharacterNotFoundError(id)
    }

    await characterRepository.delete(id)
  },

  assertCanAccessCharacter,
}