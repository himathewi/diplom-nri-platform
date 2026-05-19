import { httpClient } from './httpClient'
import type {
  CreateReportPayload,
  SessionReport,
  UpdateReportPayload,
} from '../types/report'

export const reportsApi = {
  getBySessionId(sessionId: string) {
    return httpClient.get<SessionReport>(`/sessions/${sessionId}/report`)
  },

  getById(id: string) {
    return httpClient.get<SessionReport>(`/reports/${id}`)
  },

  create(sessionId: string, payload: CreateReportPayload = {}) {
    return httpClient.post<SessionReport>(
      `/sessions/${sessionId}/report`,
      payload,
    )
  },

  update(id: string, payload: UpdateReportPayload) {
    return httpClient.patch<SessionReport>(`/reports/${id}`, payload)
  },

  delete(id: string) {
    return httpClient.delete<void>(`/reports/${id}`)
  },
}