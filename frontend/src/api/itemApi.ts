import { httpClient } from './httpClient'
import type {
  AllowSessionItemPayload,
  CatalogItem,
  GrantParticipantItemPayload,
  ParticipantItem,
  SessionAllowedItem,
  UpdateCatalogItemPayload,
  UpdateParticipantItemPayload,
  UpdateSessionAllowedItemPayload,
  CreateCatalogItemPayload,
} from '../types/items'

export const itemApi = {
  getCatalogItems() {
    return httpClient.get<CatalogItem[]>('/items')
  },

  getCatalogItemById(id: string) {
    return httpClient.get<CatalogItem>(`/items/${id}`)
  },

  createCatalogItem(payload: CreateCatalogItemPayload) {
    return httpClient.post<CatalogItem>('/items', payload)
  },

  updateCatalogItem(id: string, payload: UpdateCatalogItemPayload) {
    return httpClient.patch<CatalogItem>(`/items/${id}`, payload)
  },

  deleteCatalogItem(id: string) {
    return httpClient.delete<void>(`/items/${id}`)
  },

  getSessionItems(sessionId: string) {
    return httpClient.get<SessionAllowedItem[]>(`/sessions/${sessionId}/items`)
  },

  allowSessionItem(sessionId: string, payload: AllowSessionItemPayload) {
    return httpClient.post<SessionAllowedItem>(
      `/sessions/${sessionId}/items`,
      payload,
    )
  },

  updateSessionAllowedItem(
    sessionId: string,
    itemId: string,
    payload: UpdateSessionAllowedItemPayload,
  ) {
    return httpClient.patch<SessionAllowedItem>(
      `/sessions/${sessionId}/items/${itemId}`,
      payload,
    )
  },

  removeSessionAllowedItem(sessionId: string, itemId: string) {
    return httpClient.delete<void>(`/sessions/${sessionId}/items/${itemId}`)
  },

  getParticipantItems(participantId: string) {
    return httpClient.get<ParticipantItem[]>(
      `/session-participants/${participantId}/items`,
    )
  },

  grantParticipantItem(
    participantId: string,
    payload: GrantParticipantItemPayload,
  ) {
    return httpClient.post<ParticipantItem>(
      `/session-participants/${participantId}/items`,
      payload,
    )
  },

  updateParticipantItem(
    itemId: string,
    payload: UpdateParticipantItemPayload,
  ) {
    return httpClient.patch<ParticipantItem>(
      `/participant-items/${itemId}`,
      payload,
    )
  },

  deleteParticipantItem(itemId: string) {
    return httpClient.delete<void>(`/participant-items/${itemId}`)
  },
}