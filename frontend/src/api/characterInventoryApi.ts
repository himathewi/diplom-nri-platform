import type {
  CharacterItemResponse,
  ItemEffect,
  ItemType,
} from '../types/items'
import { httpClient } from './httpClient'
import { removeUndefinedValues } from './apiPayload'

export type CreateItemInput = {
  itemTemplateId?: string | null
  nameSnapshot?: string
  quantity?: number
  notes?: string | null
  type?: ItemType | string | null
  effects?: ItemEffect[]
}

export type UpdateItemInput = Partial<CreateItemInput>

export function addItem(
  characterId: string,
  data: CreateItemInput
): Promise<CharacterItemResponse> {
  return httpClient.post<CharacterItemResponse>(
    `/characters/${characterId}/items`,
    removeUndefinedValues(data)
  )
}

export function updateItem(
  characterId: string,
  itemId: string,
  data: UpdateItemInput
): Promise<CharacterItemResponse> {
  return httpClient.patch<CharacterItemResponse>(
    `/characters/${characterId}/items/${itemId}`,
    removeUndefinedValues(data)
  )
}

export function deleteItem(
  characterId: string,
  itemId: string
): Promise<void> {
  return httpClient.delete<void>(`/characters/${characterId}/items/${itemId}`)
}
