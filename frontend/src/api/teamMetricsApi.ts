import { httpClient } from './httpClient'
import type {
  CreateTeamMetricPayload,
  TeamMetric,
  UpdateTeamMetricPayload,
} from '../types/teamMetric'

export const teamMetricsApi = {
  getSessionMetric(sessionId: string) {
    return httpClient.get<TeamMetric>(`/sessions/${sessionId}/metrics`)
  },

  getMetricById(metricId: string) {
    return httpClient.get<TeamMetric>(`/team-metrics/${metricId}`)
  },

  createMetric(sessionId: string, payload: CreateTeamMetricPayload) {
    return httpClient.post<TeamMetric>(`/sessions/${sessionId}/metrics`, payload)
  },

  updateMetric(metricId: string, payload: UpdateTeamMetricPayload) {
    return httpClient.patch<TeamMetric>(`/team-metrics/${metricId}`, payload)
  },

  deleteMetric(metricId: string) {
    return httpClient.delete<void>(`/team-metrics/${metricId}`)
  },
}