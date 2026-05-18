import { httpClient } from './httpClient'
import type {
  CreateScenarioPayload,
  CreateScenarioTaskPayload,
  Scenario,
  ScenarioTask,
  UpdateScenarioPayload,
} from '../types/scenario'

export const scenariosApi = {
  getScenarios() {
    return httpClient.get<Scenario[]>('/scenarios')
  },

  getScenarioById(id: string) {
    return httpClient.get<Scenario>(`/scenarios/${id}`)
  },

  createScenario(payload: CreateScenarioPayload) {
    return httpClient.post<Scenario>('/scenarios', payload)
  },

  updateScenario(id: string, payload: UpdateScenarioPayload) {
    return httpClient.patch<Scenario>(`/scenarios/${id}`, payload)
  },

  deleteScenario(id: string) {
    return httpClient.delete<void>(`/scenarios/${id}`)
  },

  addScenarioTask(scenarioId: string, payload: CreateScenarioTaskPayload) {
    return httpClient.post<ScenarioTask>(
      `/scenarios/${scenarioId}/tasks`,
      payload,
    )
  },

  deleteScenarioTask(scenarioId: string, taskId: string) {
    return httpClient.delete<void>(`/scenarios/${scenarioId}/tasks/${taskId}`)
  },
}