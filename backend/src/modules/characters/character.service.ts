import type {
  CreateCharacterInput,
  SessionCharacterCreationInput,
  UpdateCharacterInput,
} from './character.schemas'
import { characterRepository } from './character.repository'
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
import { toCharacterProfileDto } from './character.mappers'
import type { CurrentUser } from '../../shared/types'
import { getAbilityModifier } from '../calculation/stats.rules'

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
    teamId: string | null
    team: { members: { userId: string }[] } | null
  },
  currentUser: CurrentUser,
) {
  if (currentUser.role === 'ADMIN') {
    return true
  }

  if (
    currentUser.role === 'MODERATOR' &&
    session.moderatorId === currentUser.id
  ) {
    return true
  }

  if (!session.teamId) {
    return currentUser.role === 'PARTICIPANT'
  }

  return (
    currentUser.role === 'PARTICIPANT' &&
    Boolean(
      session.team?.members.some((member) => member.userId === currentUser.id),
    )
  )
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

    return {
      session: {
        id: session.id,
        status: session.status,
        scenario: session.scenario,
      },
      roleClasses: session.allowedRoleClasses.map(
        (allowedRoleClass) => allowedRoleClass.roleClass,
      ),
      startingItems: session.allowedItemTemplates.map(
        (allowedItem) => allowedItem.itemTemplate,
      ),
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
    assertRoleClassAllowed(session, data.roleClassId)

    const existingProfiles =
      await characterRepository.countCharactersBySessionAndUser(
        sessionId,
        currentUser.id,
      )

    if (existingProfiles > 0) {
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

    if (data.currentFatigue !== undefined) {
      if (data.currentFatigue > character.fatigueLimit) {
        throw new CurrentFatigueExceedsLimitError(
          data.currentFatigue,
          character.fatigueLimit,
        )
      }
    }

    if (data.roleClassId) {
      await assertRoleClassAllowedForCharacterSessions(id, data.roleClassId)
    }

    const updatedCharacter = await characterRepository.update(id, data)

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
