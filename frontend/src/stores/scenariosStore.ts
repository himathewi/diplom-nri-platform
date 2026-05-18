import { create } from 'zustand'
import { scenariosApi } from '../api/scenariosApi'
import type {
  CreateScenarioPayload,
  CreateScenarioTaskPayload,
  Scenario,
  UpdateScenarioPayload,
} from '../types/scenario'

type ScenariosState = {
  scenarios: Scenario[]
  selectedScenario: Scenario | null
  isLoading: boolean
  error: string | null

  fetchScenarios: () => Promise<void>
  fetchScenarioById: (id: string) => Promise<void>
  createScenario: (payload: CreateScenarioPayload) => Promise<Scenario>
  updateScenario: (
    id: string,
    payload: UpdateScenarioPayload,
  ) => Promise<Scenario>
  deleteScenario: (id: string) => Promise<void>
  addScenarioTask: (
    scenarioId: string,
    payload: CreateScenarioTaskPayload,
  ) => Promise<void>
  deleteScenarioTask: (scenarioId: string, taskId: string) => Promise<void>
  clearSelectedScenario: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Произошла неизвестная ошибка'
}

export const useScenariosStore = create<ScenariosState>((set, get) => ({
  scenarios: [],
  selectedScenario: null,
  isLoading: false,
  error: null,

  async fetchScenarios() {
    set({ isLoading: true, error: null })

    try {
      const scenarios = await scenariosApi.getScenarios()

      set({
        scenarios,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async fetchScenarioById(id: string) {
    set({ isLoading: true, error: null })

    try {
      const scenario = await scenariosApi.getScenarioById(id)

      set({
        selectedScenario: scenario,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async createScenario(payload: CreateScenarioPayload) {
    set({ isLoading: true, error: null })

    try {
      const scenario = await scenariosApi.createScenario(payload)

      set((state) => ({
        scenarios: [scenario, ...state.scenarios],
        selectedScenario: scenario,
        isLoading: false,
      }))

      return scenario
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      throw error
    }
  },

  async updateScenario(id: string, payload: UpdateScenarioPayload) {
    set({ isLoading: true, error: null })

    try {
      const updatedScenario = await scenariosApi.updateScenario(id, payload)

      set((state) => ({
        scenarios: state.scenarios.map((scenario) =>
          scenario.id === id ? updatedScenario : scenario,
        ),
        selectedScenario:
          state.selectedScenario?.id === id
            ? updatedScenario
            : state.selectedScenario,
        isLoading: false,
      }))

      return updatedScenario
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      throw error
    }
  },

  async deleteScenario(id: string) {
    set({ isLoading: true, error: null })

    try {
      await scenariosApi.deleteScenario(id)

      set((state) => ({
        scenarios: state.scenarios.filter((scenario) => scenario.id !== id),
        selectedScenario:
          state.selectedScenario?.id === id ? null : state.selectedScenario,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      throw error
    }
  },

  async addScenarioTask(
    scenarioId: string,
    payload: CreateScenarioTaskPayload,
  ) {
    set({ isLoading: true, error: null })

    try {
      await scenariosApi.addScenarioTask(scenarioId, payload)

      await get().fetchScenarioById(scenarioId)

      set({ isLoading: false })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      throw error
    }
  },

  async deleteScenarioTask(scenarioId: string, taskId: string) {
    set({ isLoading: true, error: null })

    try {
      await scenariosApi.deleteScenarioTask(scenarioId, taskId)

      set((state) => ({
        selectedScenario:
          state.selectedScenario?.id === scenarioId
            ? {
                ...state.selectedScenario,
                tasks: state.selectedScenario.tasks.filter(
                  (task) => task.id !== taskId,
                ),
              }
            : state.selectedScenario,
        scenarios: state.scenarios.map((scenario) =>
          scenario.id === scenarioId
            ? {
                ...scenario,
                tasks: scenario.tasks.filter((task) => task.id !== taskId),
              }
            : scenario,
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      throw error
    }
  },

  clearSelectedScenario() {
    set({ selectedScenario: null })
  },

  clearError() {
    set({ error: null })
  },
}))