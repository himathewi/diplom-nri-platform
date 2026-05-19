import { create } from 'zustand'
import { reportsApi } from '../api/reportsApi'
import type {
  CreateReportPayload,
  SessionReport,
  UpdateReportPayload,
} from '../types/report'

type ReportsState = {
  selectedReport: SessionReport | null
  isLoading: boolean
  error: string | null

  fetchReportBySessionId: (sessionId: string) => Promise<SessionReport | null>
  fetchReportById: (id: string) => Promise<SessionReport | null>
  createReport: (
    sessionId: string,
    payload?: CreateReportPayload,
  ) => Promise<SessionReport | null>
  updateReport: (
    id: string,
    payload: UpdateReportPayload,
  ) => Promise<SessionReport | null>
  deleteReport: (id: string) => Promise<boolean>

  clearSelectedReport: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useReportsStore = create<ReportsState>((set) => ({
  selectedReport: null,
  isLoading: false,
  error: null,

  async fetchReportBySessionId(sessionId) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const report = await reportsApi.getBySessionId(sessionId)

      set({
        selectedReport: report,
        isLoading: false,
      })

      return report
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async fetchReportById(id) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const report = await reportsApi.getById(id)

      set({
        selectedReport: report,
        isLoading: false,
      })

      return report
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async createReport(sessionId, payload = {}) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const report = await reportsApi.create(sessionId, payload)

      set({
        selectedReport: report,
        isLoading: false,
      })

      return report
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateReport(id, payload) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const report = await reportsApi.update(id, payload)

      set({
        selectedReport: report,
        isLoading: false,
      })

      return report
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async deleteReport(id) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      await reportsApi.delete(id)

      set({
        selectedReport: null,
        isLoading: false,
      })

      return true
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return false
    }
  },

  clearSelectedReport() {
    set({
      selectedReport: null,
    })
  },

  clearError() {
    set({
      error: null,
    })
  },
}))