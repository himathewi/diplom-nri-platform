import { httpClient } from './httpClient'
import type {
  AddSessionParticipantPayload,
  CreateSessionPayload,
  GameSession,
  SessionParticipant,
  UpdateSessionPayload,
} from '../types/session'

export const sessionsApi = {
  getSessions() {
    return httpClient.get<GameSession[]>('/sessions')
  },

  getSessionById(id: string) {
    return httpClient.get<GameSession>(`/sessions/${id}`)
  },

  createSession(payload: CreateSessionPayload) {
    return httpClient.post<GameSession>('/sessions', payload)
  },

  updateSession(id: string, payload: UpdateSessionPayload) {
    return httpClient.patch<GameSession>(`/sessions/${id}`, payload)
  },

  deleteSession(id: string) {
    return httpClient.delete<void>(`/sessions/${id}`)
  },

  startSession(id: string) {
    return httpClient.post<GameSession>(`/sessions/${id}/start`)
  },

  finishSession(id: string) {
    return httpClient.post<GameSession>(`/sessions/${id}/finish`)
  },

  addParticipant(id: string, payload: AddSessionParticipantPayload) {
    return httpClient.post<SessionParticipant>(
      `/sessions/${id}/participants`,
      payload,
    )
  },

  removeParticipant(id: string, participantId: string) {
    return httpClient.delete<void>(
      `/sessions/${id}/participants/${participantId}`,
    )
  },
}