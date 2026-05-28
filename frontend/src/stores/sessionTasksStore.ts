import { create } from 'zustand'
import { sessionTasksApi } from '../api/sessionTasksApi'
import type {
  CreateSessionTaskPayload,
  CreateTaskAttemptPayload,
  EvaluateTaskAttemptPayload,
  SessionTask,
  TaskAttempt,
  UpdateSessionTaskPayload,
  UpdateSessionTaskStatusPayload,
} from '../types/sessionTask'

type SessionTasksState = {
  sessionTasks: SessionTask[]
  selectedSessionTask: SessionTask | null
  taskAttempts: TaskAttempt[]
  isLoading: boolean
  error: string | null

  fetchSessionTasks: (sessionId: string) => Promise<void>
  fetchSessionTaskById: (id: string) => Promise<SessionTask | null>
  createSessionTask: (
    sessionId: string,
    payload: CreateSessionTaskPayload,
  ) => Promise<SessionTask | null>
  updateSessionTask: (
    id: string,
    payload: UpdateSessionTaskPayload,
  ) => Promise<SessionTask | null>
  deleteSessionTask: (id: string) => Promise<boolean>

  createTaskAttempt: (
    sessionTaskId: string,
    payload: CreateTaskAttemptPayload,
  ) => Promise<TaskAttempt | null>
  updateSessionTaskStatus: (
    id: string,
    payload: UpdateSessionTaskStatusPayload,
  ) => Promise<SessionTask | null>
  evaluateTaskAttempt: (
    id: string,
    payload: EvaluateTaskAttemptPayload,
  ) => Promise<TaskAttempt | null>

  clearSelectedSessionTask: () => void
  clearSessionTasks: () => void
  clearTaskAttempts: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useSessionTasksStore = create<SessionTasksState>((set) => ({
  sessionTasks: [],
  selectedSessionTask: null,
  taskAttempts: [],
  isLoading: false,
  error: null,

  async fetchSessionTasks(sessionId) {
    set({ isLoading: true, error: null })

    try {
      const sessionTasks = await sessionTasksApi.getSessionTasks(sessionId)

      set({
        sessionTasks,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async fetchSessionTaskById(id) {
    set({ isLoading: true, error: null })

    try {
      const sessionTask = await sessionTasksApi.getSessionTaskById(id)

      set({
        selectedSessionTask: sessionTask,
        taskAttempts: sessionTask.attempts ?? [],
        isLoading: false,
      })

      return sessionTask
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async createSessionTask(sessionId, payload) {
    set({ isLoading: true, error: null })

    try {
      const sessionTask = await sessionTasksApi.createSessionTask(
        sessionId,
        payload,
      )

      set((state) => ({
        sessionTasks: [sessionTask, ...state.sessionTasks],
        selectedSessionTask: sessionTask,
        isLoading: false,
      }))

      return sessionTask
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateSessionTask(id, payload) {
    set({ isLoading: true, error: null })

    try {
      const updatedSessionTask = await sessionTasksApi.updateSessionTask(
        id,
        payload,
      )

      set((state) => ({
        sessionTasks: state.sessionTasks.map((task) =>
          task.id === id ? updatedSessionTask : task,
        ),
        selectedSessionTask:
          state.selectedSessionTask?.id === id
            ? updatedSessionTask
            : state.selectedSessionTask,
        isLoading: false,
      }))

      return updatedSessionTask
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async deleteSessionTask(id) {
    set({ isLoading: true, error: null })

    try {
      await sessionTasksApi.deleteSessionTask(id)

      set((state) => ({
        sessionTasks: state.sessionTasks.filter((task) => task.id !== id),
        selectedSessionTask:
          state.selectedSessionTask?.id === id
            ? null
            : state.selectedSessionTask,
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

  async createTaskAttempt(sessionTaskId, payload) {
    set({ isLoading: true, error: null })

    try {
      const taskAttempt = await sessionTasksApi.createTaskAttempt(
        sessionTaskId,
        payload,
      )

      set((state) => ({
        taskAttempts: [taskAttempt, ...state.taskAttempts],
        selectedSessionTask: state.selectedSessionTask
          ? {
              ...state.selectedSessionTask,
              attempts: [
                taskAttempt,
                ...(state.selectedSessionTask.attempts ?? []),
              ],
            }
          : state.selectedSessionTask,
        isLoading: false,
      }))

      return taskAttempt
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateSessionTaskStatus(id, payload) {
    set({ isLoading: true, error: null })

    try {
      const updatedSessionTask = await sessionTasksApi.updateSessionTaskStatus(
        id,
        payload,
      )

      set((state) => ({
        sessionTasks: state.sessionTasks.map((task) =>
          task.id === id ? updatedSessionTask : task,
        ),
        selectedSessionTask:
          state.selectedSessionTask?.id === id
            ? updatedSessionTask
            : state.selectedSessionTask,
        isLoading: false,
      }))

      return updatedSessionTask
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async evaluateTaskAttempt(id, payload) {
    set({ isLoading: true, error: null })

    try {
      const evaluatedAttempt = await sessionTasksApi.evaluateTaskAttempt(
        id,
        payload,
      )

      set((state) => ({
        taskAttempts: state.taskAttempts.map((attempt) =>
          attempt.id === id ? evaluatedAttempt : attempt,
        ),
        selectedSessionTask: state.selectedSessionTask
          ? {
              ...state.selectedSessionTask,
              attempts: (state.selectedSessionTask.attempts ?? []).map(
                (attempt) => (attempt.id === id ? evaluatedAttempt : attempt),
              ),
            }
          : state.selectedSessionTask,
        isLoading: false,
      }))

      return evaluatedAttempt
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  clearSelectedSessionTask() {
    set({ selectedSessionTask: null })
  },

  clearSessionTasks() {
    set({ sessionTasks: [] })
  },

  clearTaskAttempts() {
    set({ taskAttempts: [] })
  },

  clearError() {
    set({ error: null })
  },
}))