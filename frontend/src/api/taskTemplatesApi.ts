import { httpClient } from './httpClient'
import type {
  CreateTaskTemplatePayload,
  TaskTemplate,
  UpdateTaskTemplatePayload,
} from '../types/taskTemplate'

export const taskTemplatesApi = {
  getTaskTemplates() {
    return httpClient.get<TaskTemplate[]>('/task-templates')
  },

  getTaskTemplateById(id: string) {
    return httpClient.get<TaskTemplate>(`/task-templates/${id}`)
  },

  createTaskTemplate(payload: CreateTaskTemplatePayload) {
    return httpClient.post<TaskTemplate>('/task-templates', payload)
  },

  updateTaskTemplate(id: string, payload: UpdateTaskTemplatePayload) {
    return httpClient.patch<TaskTemplate>(`/task-templates/${id}`, payload)
  },

  deleteTaskTemplate(id: string) {
    return httpClient.delete<void>(`/task-templates/${id}`)
  },
}