import { create } from 'zustand'
import { itemApi } from '../api/itemApi'
import type {
  AllowSessionItemPayload,
  CatalogItem,
  CreateCatalogItemPayload,
  GrantParticipantItemPayload,
  ParticipantItem,
  SessionAllowedItem,
  UpdateParticipantItemPayload,
} from '../types/items'

type ItemsState = {
  catalogItems: CatalogItem[]
  sessionItems: SessionAllowedItem[]
  participantItemsByParticipantId: Record<string, ParticipantItem[]>
  isLoading: boolean
  error: string | null

  fetchCatalogItems: () => Promise<void>
  createCatalogItem: (
    payload: CreateCatalogItemPayload,
  ) => Promise<CatalogItem | null>

  fetchSessionItems: (sessionId: string) => Promise<void>
  allowSessionItem: (
    sessionId: string,
    payload: AllowSessionItemPayload,
  ) => Promise<SessionAllowedItem | null>
  removeSessionAllowedItem: (
    sessionId: string,
    itemId: string,
  ) => Promise<boolean>

  fetchParticipantItems: (participantId: string) => Promise<void>
  grantParticipantItem: (
    participantId: string,
    payload: GrantParticipantItemPayload,
  ) => Promise<ParticipantItem | null>
  updateParticipantItem: (
    itemId: string,
    participantId: string,
    payload: UpdateParticipantItemPayload,
  ) => Promise<ParticipantItem | null>
  deleteParticipantItem: (
    itemId: string,
    participantId: string,
  ) => Promise<boolean>

  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useItemsStore = create<ItemsState>((set) => ({
  catalogItems: [],
  sessionItems: [],
  participantItemsByParticipantId: {},
  isLoading: false,
  error: null,

  async fetchCatalogItems() {
    set({ isLoading: true, error: null })

    try {
      const catalogItems = await itemApi.getCatalogItems()
      set({ catalogItems, isLoading: false })
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
    }
  },

  async createCatalogItem(payload) {
    set({ isLoading: true, error: null })

    try {
      const item = await itemApi.createCatalogItem(payload)

      set((state) => ({
        catalogItems: [item, ...state.catalogItems],
        isLoading: false,
      }))

      return item
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
      return null
    }
  },

  async fetchSessionItems(sessionId) {
    set({ isLoading: true, error: null })

    try {
      const sessionItems = await itemApi.getSessionItems(sessionId)
      set({ sessionItems, isLoading: false })
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
    }
  },

  async allowSessionItem(sessionId, payload) {
    set({ isLoading: true, error: null })

    try {
      const sessionItem = await itemApi.allowSessionItem(sessionId, payload)

      set((state) => ({
        sessionItems: [sessionItem, ...state.sessionItems],
        isLoading: false,
      }))

      return sessionItem
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
      return null
    }
  },

  async removeSessionAllowedItem(sessionId, itemId) {
    set({ isLoading: true, error: null })

    try {
      await itemApi.removeSessionAllowedItem(sessionId, itemId)

      set((state) => ({
        sessionItems: state.sessionItems.filter(
          (sessionItem) => sessionItem.itemId !== itemId && sessionItem.id !== itemId,
        ),
        isLoading: false,
      }))

      return true
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
      return false
    }
  },

  async fetchParticipantItems(participantId) {
    set({ isLoading: true, error: null })

    try {
      const participantItems = await itemApi.getParticipantItems(participantId)

      set((state) => ({
        participantItemsByParticipantId: {
          ...state.participantItemsByParticipantId,
          [participantId]: participantItems,
        },
        isLoading: false,
      }))
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
    }
  },

  async grantParticipantItem(participantId, payload) {
    set({ isLoading: true, error: null })

    try {
      const participantItem = await itemApi.grantParticipantItem(
        participantId,
        payload,
      )

      set((state) => ({
        participantItemsByParticipantId: {
          ...state.participantItemsByParticipantId,
          [participantId]: [
            participantItem,
            ...(state.participantItemsByParticipantId[participantId] ?? []),
          ],
        },
        isLoading: false,
      }))

      return participantItem
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
      return null
    }
  },

  async updateParticipantItem(itemId, participantId, payload) {
    set({ isLoading: true, error: null })

    try {
      const updatedItem = await itemApi.updateParticipantItem(itemId, payload)

      set((state) => ({
        participantItemsByParticipantId: {
          ...state.participantItemsByParticipantId,
          [participantId]: (
            state.participantItemsByParticipantId[participantId] ?? []
          ).map((item) => (item.id === itemId ? updatedItem : item)),
        },
        isLoading: false,
      }))

      return updatedItem
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
      return null
    }
  },

  async deleteParticipantItem(itemId, participantId) {
    set({ isLoading: true, error: null })

    try {
      await itemApi.deleteParticipantItem(itemId)

      set((state) => ({
        participantItemsByParticipantId: {
          ...state.participantItemsByParticipantId,
          [participantId]: (
            state.participantItemsByParticipantId[participantId] ?? []
          ).filter((item) => item.id !== itemId),
        },
        isLoading: false,
      }))

      return true
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
      return false
    }
  },

  clearError() {
    set({ error: null })
  },
}))