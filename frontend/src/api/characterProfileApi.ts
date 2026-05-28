import type { Character, RoleClass, Stats } from '../types/characters'
import type { ItemTemplateResponse } from '../types/items'
import { httpClient } from './httpClient'
import { removeUndefinedValues } from './apiPayload'

export type CharacterOptions = {
  session: {
    id: string
    status: string
    scenario: {
      id: string
      title: string
      description: string
      domain: string
      goal: string
      difficulty: number
    }
  }
  roleClasses: RoleClass[]
  startingItems: ItemTemplateResponse[]
  creationRules: {
    oneProfilePerSession: boolean
    fatigueLimitFormula: string
    modifierFormula: string
    allowedStats: (keyof Stats)[]
  }
}

export type CreateSessionCharacterInput = {
  name: string
  roleClassId: string
  baseStats?: Stats
  description?: string | null
  professionalFunction?: string | null
}

export type CreateCharacterInput = CreateSessionCharacterInput & {
  sessionId: string
}

export type UpdateCharacterInput = {
  name?: string
  roleClassId?: string | null
  description?: string | null
  professionalFunction?: string | null
  currentFatigue?: number
}

function mapCreateCharacterPayloadToBackend(
  data: CreateSessionCharacterInput
) {
  return removeUndefinedValues({
    name: data.name,
    roleClassId: data.roleClassId,
    baseStats: data.baseStats,
    description: data.description,
    professionalFunction: data.professionalFunction,
  })
}

function mapUpdateCharacterPayloadToBackend(data: UpdateCharacterInput) {
  return removeUndefinedValues({
    name: data.name,
    roleClassId: data.roleClassId,
    description: data.description,
    professionalFunction: data.professionalFunction,
    currentFatigue: data.currentFatigue,
  })
}

export function getCharacters(): Promise<Character[]> {
  return httpClient.get<Character[]>('/characters')
}

export function getCharacterById(id: string): Promise<Character> {
  return httpClient.get<Character>(`/characters/${id}`)
}

export function getCharacterOptions(
  sessionId: string
): Promise<CharacterOptions> {
  return httpClient.get<CharacterOptions>(
    `/sessions/${sessionId}/character-options`
  )
}

export function createCharacterForSession(
  sessionId: string,
  data: CreateSessionCharacterInput
): Promise<Character> {
  return httpClient.post<Character>(
    `/sessions/${sessionId}/characters`,
    mapCreateCharacterPayloadToBackend(data)
  )
}

export function createCharacter(
  data: CreateCharacterInput
): Promise<Character> {
  const { sessionId, ...characterData } = data

  return createCharacterForSession(sessionId, characterData)
}

export function updateCharacter(
  id: string,
  data: UpdateCharacterInput
): Promise<Character> {
  return httpClient.patch<Character>(
    `/characters/${id}`,
    mapUpdateCharacterPayloadToBackend(data)
  )
}

export function deleteCharacter(id: string): Promise<void> {
  return httpClient.delete<void>(`/characters/${id}`)
}
