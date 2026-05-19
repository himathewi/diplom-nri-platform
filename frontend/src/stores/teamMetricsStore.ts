import { create } from 'zustand'
import { teamMetricsApi } from '../api/teamMetricsApi'
import type {
  CreateTeamMetricPayload,
  TeamMetric,
  UpdateTeamMetricPayload,
} from '../types/teamMetric'

type TeamMetricsState = {
  selectedMetric: TeamMetric | null
  isLoading: boolean
  error: string | null

  fetchSessionMetric: (sessionId: string) => Promise<void>
  fetchMetricById: (metricId: string) => Promise<void>
  createMetric: (
    sessionId: string,
    payload: CreateTeamMetricPayload,
  ) => Promise<TeamMetric | null>
  updateMetric: (
    metricId: string,
    payload: UpdateTeamMetricPayload,
  ) => Promise<TeamMetric | null>
  deleteMetric: (metricId: string) => Promise<boolean>

  setSelectedMetric: (metric: TeamMetric | null) => void
  clearSelectedMetric: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useTeamMetricsStore = create<TeamMetricsState>((set, get) => ({
  selectedMetric: null,
  isLoading: false,
  error: null,

  async fetchSessionMetric(sessionId) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const metric = await teamMetricsApi.getSessionMetric(sessionId)

      set({
        selectedMetric: metric,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async fetchMetricById(metricId) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const metric = await teamMetricsApi.getMetricById(metricId)

      set({
        selectedMetric: metric,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async createMetric(sessionId, payload) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const metric = await teamMetricsApi.createMetric(sessionId, payload)

      set({
        selectedMetric: metric,
        isLoading: false,
      })

      return metric
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateMetric(metricId, payload) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const updatedMetric = await teamMetricsApi.updateMetric(metricId, payload)

      const selectedMetric = get().selectedMetric

      set({
        selectedMetric:
          selectedMetric?.id === metricId ? updatedMetric : selectedMetric,
        isLoading: false,
      })

      return updatedMetric
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async deleteMetric(metricId) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      await teamMetricsApi.deleteMetric(metricId)

      const selectedMetric = get().selectedMetric

      set({
        selectedMetric: selectedMetric?.id === metricId ? null : selectedMetric,
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

  setSelectedMetric(metric) {
    set({
      selectedMetric: metric,
    })
  },

  clearSelectedMetric() {
    set({
      selectedMetric: null,
    })
  },

  clearError() {
    set({
      error: null,
    })
  },
}))