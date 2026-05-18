import { create } from 'zustand'
import { sessionsApi } from '../api/sessionsApi'
import type {
  AddSessionParticipantPayload,
  CreateSessionPayload,
  GameSession,
  UpdateSessionPayload,
} from '../types/session'

type SessionsState = {
  sessions: GameSession[]
  selectedSession: GameSession | null
  isLoading: boolean
  error: string | null

  fetchSessions: () => Promise<void>
  fetchSessionById: (id: string) => Promise<GameSession | null>
  createSession: (payload: CreateSessionPayload) => Promise<GameSession | null>
  updateSession: (
    id: string,
    payload: UpdateSessionPayload,
  ) => Promise<GameSession | null>
  deleteSession: (id: string) => Promise<boolean>

  startSession: (id: string) => Promise<GameSession | null>
  finishSession: (id: string) => Promise<GameSession | null>

  addParticipant: (
    id: string,
    payload: AddSessionParticipantPayload,
  ) => Promise<GameSession | null>
  removeParticipant: (
    id: string,
    participantId: string,
  ) => Promise<GameSession | null>

  clearSelectedSession: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useSessionsStore = create<SessionsState>((set) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,
  error: null,

  async fetchSessions() {
    set({ isLoading: true, error: null })

    try {
      const sessions = await sessionsApi.getSessions()

      set({
        sessions,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async fetchSessionById(id) {
    set({ isLoading: true, error: null })

    try {
      const session = await sessionsApi.getSessionById(id)

      set({
        selectedSession: session,
        isLoading: false,
      })

      return session
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async createSession(payload) {
    set({ isLoading: true, error: null })

    try {
      const session = await sessionsApi.createSession(payload)

      set((state) => ({
        sessions: [session, ...state.sessions],
        selectedSession: session,
        isLoading: false,
      }))

      return session
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateSession(id, payload) {
    set({ isLoading: true, error: null })

    try {
      const updatedSession = await sessionsApi.updateSession(id, payload)

      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? updatedSession : session,
        ),
        selectedSession:
          state.selectedSession?.id === id
            ? updatedSession
            : state.selectedSession,
        isLoading: false,
      }))

      return updatedSession
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async deleteSession(id) {
    set({ isLoading: true, error: null })

    try {
      await sessionsApi.deleteSession(id)

      set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== id),
        selectedSession:
          state.selectedSession?.id === id ? null : state.selectedSession,
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

  async startSession(id) {
    set({ isLoading: true, error: null })

    try {
      const startedSession = await sessionsApi.startSession(id)

      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? startedSession : session,
        ),
        selectedSession:
          state.selectedSession?.id === id
            ? startedSession
            : state.selectedSession,
        isLoading: false,
      }))

      return startedSession
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async finishSession(id) {
    set({ isLoading: true, error: null })

    try {
      const finishedSession = await sessionsApi.finishSession(id)

      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? finishedSession : session,
        ),
        selectedSession:
          state.selectedSession?.id === id
            ? finishedSession
            : state.selectedSession,
        isLoading: false,
      }))

      return finishedSession
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async addParticipant(id, payload) {
    set({ isLoading: true, error: null })

    try {
      await sessionsApi.addParticipant(id, payload)

      const updatedSession = await sessionsApi.getSessionById(id)

      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? updatedSession : session,
        ),
        selectedSession:
          state.selectedSession?.id === id
            ? updatedSession
            : state.selectedSession,
        isLoading: false,
      }))

      return updatedSession
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async removeParticipant(id, participantId) {
    set({ isLoading: true, error: null })

    try {
      await sessionsApi.removeParticipant(id, participantId)

      const updatedSession = await sessionsApi.getSessionById(id)

      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? updatedSession : session,
        ),
        selectedSession:
          state.selectedSession?.id === id
            ? updatedSession
            : state.selectedSession,
        isLoading: false,
      }))

      return updatedSession
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  clearSelectedSession() {
    set({ selectedSession: null })
  },

  clearError() {
    set({ error: null })
  },
}))