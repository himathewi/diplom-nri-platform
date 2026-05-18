import { create } from 'zustand'
import { sessionEventsApi } from '../api/sessionEventsApi'
import type {
  CreateSessionEventPayload,
  SessionEvent,
  UpdateSessionEventPayload,
} from '../types/sessionEvent'

type SessionEventsState = {
  events: SessionEvent[]
  selectedEvent: SessionEvent | null
  isLoading: boolean
  error: string | null

  fetchSessionEvents: (sessionId: string) => Promise<void>
  fetchSessionEventById: (id: string) => Promise<SessionEvent | null>
  createSessionEvent: (
    sessionId: string,
    payload: CreateSessionEventPayload,
  ) => Promise<SessionEvent | null>
  updateSessionEvent: (
    id: string,
    payload: UpdateSessionEventPayload,
  ) => Promise<SessionEvent | null>
  deleteSessionEvent: (id: string) => Promise<boolean>

  clearSelectedEvent: () => void
  clearEvents: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useSessionEventsStore = create<SessionEventsState>((set) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  async fetchSessionEvents(sessionId) {
    set({ isLoading: true, error: null })

    try {
      const events = await sessionEventsApi.getSessionEvents(sessionId)

      set({
        events,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async fetchSessionEventById(id) {
    set({ isLoading: true, error: null })

    try {
      const event = await sessionEventsApi.getSessionEventById(id)

      set({
        selectedEvent: event,
        isLoading: false,
      })

      return event
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async createSessionEvent(sessionId, payload) {
    set({ isLoading: true, error: null })

    try {
      const event = await sessionEventsApi.createSessionEvent(
        sessionId,
        payload,
      )

      set((state) => ({
        events: [...state.events, event],
        selectedEvent: event,
        isLoading: false,
      }))

      return event
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateSessionEvent(id, payload) {
    set({ isLoading: true, error: null })

    try {
      const updatedEvent = await sessionEventsApi.updateSessionEvent(
        id,
        payload,
      )

      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? updatedEvent : event,
        ),
        selectedEvent:
          state.selectedEvent?.id === id
            ? updatedEvent
            : state.selectedEvent,
        isLoading: false,
      }))

      return updatedEvent
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async deleteSessionEvent(id) {
    set({ isLoading: true, error: null })

    try {
      await sessionEventsApi.deleteSessionEvent(id)

      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
        selectedEvent:
          state.selectedEvent?.id === id ? null : state.selectedEvent,
        isLoading: false,
      }))

      return true
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return false
    }
  },

  clearSelectedEvent() {
    set({ selectedEvent: null })
  },

  clearEvents() {
    set({ events: [] })
  },

  clearError() {
    set({ error: null })
  },
}))