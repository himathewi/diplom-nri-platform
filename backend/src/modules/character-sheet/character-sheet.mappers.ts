import {
  applyAttributeEffects,
  calculateCharacterFatigue,
  defaultAbilityScores,
  getAbilityModifiers,
  normalizeAttributeEffects,
} from './character-sheet.calculation'

import type {
  AbilityScores,
  AttributeEffectDto,
} from './character-sheet.calculation'

import type {
  CharacterParticipantItemDto,
  CharacterProfileDto,
  CharacterScenarioDto,
  CharacterSessionDto,
  CharacterSessionResourcesDto,
  CharacterSheetDto,
  CharacterUserDto,
  RoleClassDto,
} from './character-sheet.types'

import type {
  CharacterEntity,
  CharacterStatsEntity,
  ItemEntity,
  ParticipantItemEntity,
  RoleClassEntity,
  ScenarioEntity,
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
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  }
}

export function toAbilityScores(
  stats: CharacterStatsEntity | null,
): AbilityScores {
  if (!stats) {
    return {
      ...defaultAbilityScores,
    }
  }

  return {
    strength: stats.strength,
    dexterity: stats.dexterity,
    constitution: stats.constitution,
    intelligence: stats.intelligence,
    wisdom: stats.wisdom,
    charisma: stats.charisma,
  }
}

function getItemName(item: ParticipantItemEntity) {
  return item.nameSnapshot || item.item?.name || 'Предмет'
}

function getItemAttributeEffects(
  item: ParticipantItemEntity,
): AttributeEffectDto[] {
  if (!item.item || item.isUsed) {
    return []
  }

  return normalizeAttributeEffects(item.item.attributeEffects, {
    sourceItemId: item.id,
    sourceName: getItemName(item),
  })
}

export function toParticipantItemDto(
  item: ParticipantItemEntity,
): CharacterParticipantItemDto {
  return {
    id: item.id,
    sessionParticipantId: item.sessionParticipantId,
    itemId: item.itemId,
    nameSnapshot: item.nameSnapshot,
    name: getItemName(item),
    type: item.item?.type ?? null,
    description: item.item?.description ?? null,
    quantity: item.quantity,
    notes: item.notes,
    isUsed: item.isUsed,
    attributeEffects: getItemAttributeEffects(item),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export function toScenarioDto(
  scenario: ScenarioEntity,
): CharacterScenarioDto {
  return {
    id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    goal: scenario.goal,
    difficulty: scenario.difficulty,
    direction: scenario.direction
      ? {
          id: scenario.direction.id,
          code: scenario.direction.code,
          name: scenario.direction.name,
          description: scenario.direction.description,
        }
      : null,
  }
}

export function toSessionDto(
  participant: SessionParticipantEntity,
): CharacterSessionDto {
  return {
    id: participant.id,
    sessionId: participant.sessionId,
    userId: participant.userId,
    characterId: participant.characterId,
    status: participant.session.status,
    scenario: toScenarioDto(participant.session.scenario),
    team: participant.session.team,
    startedAt: participant.session.startedAt,
    finishedAt: participant.session.finishedAt,
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt,
  }
}

export function toSessionResourcesDto(
  participant: SessionParticipantEntity,
): CharacterSessionResourcesDto {
  return {
    sessionParticipantId: participant.id,
    sessionId: participant.sessionId,
    status: participant.session.status,
    scenario: toScenarioDto(participant.session.scenario),
    items: participant.items.map(toParticipantItemDto),
  }
}

function collectActiveItemEffects(
  sessionResources: CharacterSessionResourcesDto[],
): AttributeEffectDto[] {
  return sessionResources.flatMap((resourceGroup) =>
    resourceGroup.items.flatMap((item) => item.attributeEffects),
  )
}

export function toCharacterSheetDto(
  character: CharacterEntity,
): CharacterSheetDto {
  const baseStats = toAbilityScores(character.stats)
  const sessionResources = character.sessionParticipants.map(
    toSessionResourcesDto,
  )
  const itemEffects = collectActiveItemEffects(sessionResources)
  const finalStats = applyAttributeEffects(baseStats, itemEffects)

  return {
    character: toCharacterProfileDto(character),
    user: toUserDto(character.user),
    roleClass: toRoleClassDto(character.roleClass),
    stats: {
      base: baseStats,
      itemEffects,
      final: finalStats,
      modifiers: getAbilityModifiers(finalStats),
    },
    fatigue: calculateCharacterFatigue({
      limit: character.fatigueLimit,
      current: character.currentFatigue,
    }),
    sessions: character.sessionParticipants.map(toSessionDto),
    sessionResources,
  }
}