import type { UserRole, SessionStatus, ItemType } from '@prisma/client'

import {
  getAbilityModifier,
  type AbilityScores,
} from '../character-stats/character-stats.rules'

import { CharacterSheetNotFoundError } from './character-sheet.errors'

import type {
  CharacterSheetEntity,
  CharacterSheetRepository,
} from './character-sheet.repository'

export type AbilityModifiers = AbilityScores

export type FatigueState = 'NORMAL' | 'OVERLOADED' | 'EXHAUSTED'

export type CharacterFatigueDto = {
  limit: number
  current: number
  remaining: number
  state: FatigueState
}

export type CharacterUserDto = {
  id: string
  email: string
  name: string
  role: UserRole
}

export type RoleClassDto = {
  id: string
  name: string
  description: string | null
}

export type ScenarioDirectionDto = {
  id: string
  code: string
  name: string
  description: string | null
}

export type CharacterScenarioDto = {
  id: string
  title: string
  description: string
  goal: string
  difficulty: number
  direction: ScenarioDirectionDto | null
}

export type CharacterTeamDto = {
  id: string
  name: string
  companyName: string | null
} | null

export type CharacterProfileDto = {
  id: string
  userId: string
  roleClassId: string | null
  name: string
  description: string | null
  professionalFunction: string | null
  fatigueLimit: number
  currentFatigue: number
  createdAt: Date
  updatedAt: Date
}

export type CharacterStatsDto = {
  scores: AbilityScores
  modifiers: AbilityModifiers
}

export type CharacterParticipantItemDto = {
  id: string
  sessionParticipantId: string
  itemId: string | null
  nameSnapshot: string
  name: string
  type: ItemType | null
  description: string | null
  quantity: number
  notes: string | null
  isUsed: boolean
  createdAt: Date
  updatedAt: Date
}

export type CharacterSessionDto = {
  id: string
  sessionId: string
  userId: string
  characterId: string | null
  status: SessionStatus
  scenario: CharacterScenarioDto
  team: CharacterTeamDto
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type CharacterSessionResourcesDto = {
  sessionParticipantId: string
  sessionId: string
  status: SessionStatus
  scenario: CharacterScenarioDto
  items: CharacterParticipantItemDto[]
}

export type CharacterSheetDto = {
  character: CharacterProfileDto
  user: CharacterUserDto
  roleClass: RoleClassDto | null
  stats: CharacterStatsDto
  fatigue: CharacterFatigueDto
  sessions: CharacterSessionDto[]
  sessionResources: CharacterSessionResourcesDto[]
}

type CharacterStatsEntity = CharacterSheetEntity['stats']

type SessionParticipantEntity =
  CharacterSheetEntity['sessionParticipants'][number]

type ParticipantItemEntity = SessionParticipantEntity['items'][number]

const defaultAbilityScores: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

function getAbilityModifiers(scores: AbilityScores): AbilityModifiers {
  return {
    strength: getAbilityModifier(scores.strength),
    dexterity: getAbilityModifier(scores.dexterity),
    constitution: getAbilityModifier(scores.constitution),
    intelligence: getAbilityModifier(scores.intelligence),
    wisdom: getAbilityModifier(scores.wisdom),
    charisma: getAbilityModifier(scores.charisma),
  }
}

function calculateCharacterFatigue(input: {
  limit: number
  current: number
}): CharacterFatigueDto {
  const remaining = input.limit - input.current

  if (input.current > input.limit + 1) {
    return {
      limit: input.limit,
      current: input.current,
      remaining: 0,
      state: 'EXHAUSTED',
    }
  }

  if (input.current === input.limit + 1) {
    return {
      limit: input.limit,
      current: input.current,
      remaining: 0,
      state: 'OVERLOADED',
    }
  }

  return {
    limit: input.limit,
    current: input.current,
    remaining: Math.max(0, remaining),
    state: 'NORMAL',
  }
}

function toUserDto(user: CharacterSheetEntity['user']): CharacterUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

function toRoleClassDto(
  roleClass: CharacterSheetEntity['roleClass'],
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

function toCharacterProfileDto(
  character: CharacterSheetEntity,
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

function toAbilityScores(stats: CharacterStatsEntity): AbilityScores {
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

function toStatsDto(stats: CharacterStatsEntity): CharacterStatsDto {
  const scores = toAbilityScores(stats)

  return {
    scores,
    modifiers: getAbilityModifiers(scores),
  }
}

function toScenarioDto(
  scenario: SessionParticipantEntity['session']['scenario'],
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

function toParticipantItemDto(
  item: ParticipantItemEntity,
): CharacterParticipantItemDto {
  return {
    id: item.id,
    sessionParticipantId: item.sessionParticipantId,
    itemId: item.itemId,
    nameSnapshot: item.nameSnapshot,
    name: item.nameSnapshot || item.item?.name || 'Предмет',
    type: item.item?.type ?? null,
    description: item.item?.description ?? null,
    quantity: item.quantity,
    notes: item.notes,
    isUsed: item.isUsed,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function toSessionDto(
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

function toSessionResourcesDto(
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

function toCharacterSheetDto(character: CharacterSheetEntity): CharacterSheetDto {
  return {
    character: toCharacterProfileDto(character),
    user: toUserDto(character.user),
    roleClass: toRoleClassDto(character.roleClass),
    stats: toStatsDto(character.stats),
    fatigue: calculateCharacterFatigue({
      limit: character.fatigueLimit,
      current: character.currentFatigue,
    }),
    sessions: character.sessionParticipants.map(toSessionDto),
    sessionResources: character.sessionParticipants.map(toSessionResourcesDto),
  }
}

export class CharacterSheetService {
  constructor(private readonly repository: CharacterSheetRepository) {}

  async getCharacterSheet(characterId: string): Promise<CharacterSheetDto> {
    const character = await this.repository.findByIdForSheet(characterId)

    if (!character) {
      throw new CharacterSheetNotFoundError(characterId)
    }

    return toCharacterSheetDto(character)
  }
}