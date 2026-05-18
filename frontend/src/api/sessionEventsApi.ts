import { httpClient } from './httpClient'
import type {
  CreateSessionEventPayload,
  SessionEvent,
  UpdateSessionEventPayload,
} from '../types/sessionEvent'

export const sessionEventsApi = {
  getSessionEvents(sessionId: string) {
    return httpClient.get<SessionEvent[]>(`/sessions/${sessionId}/events`)
  },

  getSessionEventById(id: string) {
    return httpClient.get<SessionEvent>(`/session-events/${id}`)
  },

  createSessionEvent(sessionId: string, payload: CreateSessionEventPayload) {
    return httpClient.post<SessionEvent>(
      `/sessions/${sessionId}/events`,
      payload,
    )
  },

  updateSessionEvent(id: string, payload: UpdateSessionEventPayload) {
    return httpClient.patch<SessionEvent>(`/session-events/${id}`, payload)
  },

  deleteSessionEvent(id: string) {
    return httpClient.delete<void>(`/session-events/${id}`)
  },
}