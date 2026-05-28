import { create } from 'zustand'
import { taskTemplatesApi } from '../api/taskTemplatesApi'
import type {
  CreateTaskTemplatePayload,
  TaskTemplate,
  UpdateTaskTemplatePayload,
} from '../types/taskTemplate'

type TaskTemplatesState = {
  taskTemplates: TaskTemplate[]
  selectedTaskTemplate: TaskTemplate | null
  isLoading: boolean
  error: string | null

  fetchTaskTemplates: () => Promise<void>
  fetchTaskTemplateById: (id: string) => Promise<TaskTemplate | null>
  createTaskTemplate: (
    payload: CreateTaskTemplatePayload,
  ) => Promise<TaskTemplate | null>
  updateTaskTemplate: (
    id: string,
    payload: UpdateTaskTemplatePayload,
  ) => Promise<TaskTemplate | null>
  deleteTaskTemplate: (id: string) => Promise<boolean>

  clearSelectedTaskTemplate: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useTaskTemplatesStore = create<TaskTemplatesState>((set) => ({
  taskTemplates: [],
  selectedTaskTemplate: null,
  isLoading: false,
  error: null,

  async fetchTaskTemplates() {
    set({ isLoading: true, error: null })

    try {
      const taskTemplates = await taskTemplatesApi.getTaskTemplates()

      set({
        taskTemplates,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async fetchTaskTemplateById(id) {
    set({ isLoading: true, error: null })

    try {
      const taskTemplate = await taskTemplatesApi.getTaskTemplateById(id)

      set({
        selectedTaskTemplate: taskTemplate,
        isLoading: false,
      })

      return taskTemplate
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async createTaskTemplate(payload) {
    set({ isLoading: true, error: null })

    try {
      const taskTemplate = await taskTemplatesApi.createTaskTemplate(payload)

      set((state) => ({
        taskTemplates: [taskTemplate, ...state.taskTemplates],
        selectedTaskTemplate: taskTemplate,
        isLoading: false,
      }))

      return taskTemplate
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateTaskTemplate(id, payload) {
    set({ isLoading: true, error: null })

    try {
      const updatedTaskTemplate = await taskTemplatesApi.updateTaskTemplate(
        id,
        payload,
      )

      set((state) => ({
        taskTemplates: state.taskTemplates.map((taskTemplate) =>
          taskTemplate.id === id ? updatedTaskTemplate : taskTemplate,
        ),
        selectedTaskTemplate:
          state.selectedTaskTemplate?.id === id
            ? updatedTaskTemplate
            : state.selectedTaskTemplate,
        isLoading: false,
      }))

      return updatedTaskTemplate
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async deleteTaskTemplate(id) {
    set({ isLoading: true, error: null })

    try {
      await taskTemplatesApi.deleteTaskTemplate(id)

      set((state) => ({
        taskTemplates: state.taskTemplates.filter(
          (taskTemplate) => taskTemplate.id !== id,
        ),
        selectedTaskTemplate:
          state.selectedTaskTemplate?.id === id
            ? null
            : state.selectedTaskTemplate,
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

  clearSelectedTaskTemplate() {
    set({ selectedTaskTemplate: null })
  },

  clearError() {
    set({ error: null })
  },
}))