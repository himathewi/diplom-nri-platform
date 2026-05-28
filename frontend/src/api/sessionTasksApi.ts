import { httpClient } from './httpClient'
import type {
  CreateSessionTaskPayload,
  CreateTaskAttemptPayload,
  EvaluateTaskAttemptPayload,
  SessionTask,
  TaskAttempt,
  UpdateSessionTaskPayload,
  UpdateSessionTaskStatusPayload,
} from '../types/sessionTask'

export const sessionTasksApi = {
  getSessionTasks(sessionId: string) {
    return httpClient.get<SessionTask[]>(`/sessions/${sessionId}/tasks`)
  },

  getSessionTaskById(id: string) {
    return httpClient.get<SessionTask>(`/session-tasks/${id}`)
  },

  createSessionTask(sessionId: string, payload: CreateSessionTaskPayload) {
    return httpClient.post<SessionTask>(`/sessions/${sessionId}/tasks`, payload)
  },

  updateSessionTask(id: string, payload: UpdateSessionTaskPayload) {
    return httpClient.patch<SessionTask>(`/session-tasks/${id}`, payload)
  },

  deleteSessionTask(id: string) {
    return httpClient.delete<void>(`/session-tasks/${id}`)
  },

  createTaskAttempt(id: string, payload: CreateTaskAttemptPayload) {
    return httpClient.post<TaskAttempt>(`/session-tasks/${id}/attempts`, payload)
  },

  updateSessionTaskStatus(
    id: string,
    payload: UpdateSessionTaskStatusPayload,
  ) {
    return httpClient.patch<SessionTask>(`/session-tasks/${id}/status`, payload)
  },

  evaluateTaskAttempt(id: string, payload: EvaluateTaskAttemptPayload) {
    return httpClient.patch<TaskAttempt>(`/task-attempts/${id}/evaluate`, payload)
  },
}