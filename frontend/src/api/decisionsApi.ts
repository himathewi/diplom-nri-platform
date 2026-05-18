import { httpClient } from './httpClient'
import type {
  CreateDecisionPayload,
  Decision,
  EvaluateDecisionPayload,
  UpdateDecisionPayload,
} from '../types/decision'

export const decisionsApi = {
  getSessionDecisions(sessionId: string) {
    return httpClient.get<Decision[]>(`/sessions/${sessionId}/decisions`)
  },

  getDecisionById(decisionId: string) {
    return httpClient.get<Decision>(`/decisions/${decisionId}`)
  },

  createDecision(sessionId: string, payload: CreateDecisionPayload) {
    return httpClient.post<Decision>(`/sessions/${sessionId}/decisions`, payload)
  },

  updateDecision(decisionId: string, payload: UpdateDecisionPayload) {
    return httpClient.patch<Decision>(`/decisions/${decisionId}`, payload)
  },

  evaluateDecision(decisionId: string, payload: EvaluateDecisionPayload) {
    return httpClient.patch<Decision>(
      `/decisions/${decisionId}/evaluate`,
      payload,
    )
  },

  deleteDecision(decisionId: string) {
    return httpClient.delete<void>(`/decisions/${decisionId}`)
  },
}