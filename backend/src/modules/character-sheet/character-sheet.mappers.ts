import type { AbilityScores } from '../calculation/stats.rules'
import { normalizeItemEffects } from '../calculation/item-effects.rules'

import type {
  CharacterItemDto,
  CharacterProfileDto,
  CharacterSessionDto,
  CharacterUserDto,
  RoleClassDto,
} from './character-sheet.types'
import type {
  CharacterEntity,
  CharacterItemEntity,
  CharacterStatsEntity,
  RoleClassEntity,
  SessionParticipantEntity,
  UserEntity,
} from './character-sheet.contracts'

export function toRoleClassDto(
  roleClass: RoleClassEntity | null,
): RoleClassDto | null {
  if (!roleClass) {
    return null
  }

  return {
    id: roleClass.id,
    name: roleClass.name,
    description: roleClass.description,
  }
}

export function toUserDto(user: UserEntity): CharacterUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export function toCharacterProfileDto(
  character: CharacterEntity,
): CharacterProfileDto {
  return {
    id: character.id,
    userId: character.userId,
    roleClassId: character.roleClassId,
    name: character.name,
    description: character.description,
    professionalFunction: character.professionalFunction,
    fatigueLimit: character.fatigueLimit,
    currentFatigue: character.currentFatigue,
    roleClass: toRoleClassDto(character.roleClass),
    user: toUserDto(character.user),
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  }
}

export function toCharacterItemDto(
  item: CharacterItemEntity,
): CharacterItemDto {
  const template = item.itemTemplate ?? null
  const hasItemType = item.type !== null && item.type !== undefined
  const hasItemEffects = item.effects !== null && item.effects !== undefined

  return {
    id: item.id,
    itemId: item.id,
    itemTemplateId: item.itemTemplateId,
    name: item.nameSnapshot || template?.name || 'Item',
    type: hasItemType ? item.type : template?.type ?? 'misc',
    effects: hasItemEffects
      ? normalizeItemEffects(item.effects)
      : normalizeItemEffects(template?.effects),
    quantity: item.quantity,
    notes: item.notes,
  }
}

export function toSessionDto(
  participant: SessionParticipantEntity,
): CharacterSessionDto {
  return {
    id: participant.id,
    sessionId: participant.sessionId,
    status: participant.session.status,
    scenario: participant.session.scenario,
    team: participant.session.team,
    createdAt: participant.createdAt,
  }
}

export function toAbilityScores(
  stats: CharacterStatsEntity,
): AbilityScores {
  return {
    strength: stats.strength,
    dexterity: stats.dexterity,
    constitution: stats.constitution,
    intelligence: stats.intelligence,
    wisdom: stats.wisdom,
    charisma: stats.charisma,
  }
}
