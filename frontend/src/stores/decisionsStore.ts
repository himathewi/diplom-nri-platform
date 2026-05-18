import { create } from 'zustand'
import { decisionsApi } from '../api/decisionsApi'
import type {
  CreateDecisionPayload,
  Decision,
  EvaluateDecisionPayload,
  UpdateDecisionPayload,
} from '../types/decision'

type DecisionsState = {
  decisions: Decision[]
  selectedDecision: Decision | null
  isLoading: boolean
  error: string | null

  fetchSessionDecisions: (sessionId: string) => Promise<void>
  fetchDecisionById: (decisionId: string) => Promise<void>
  createDecision: (
    sessionId: string,
    payload: CreateDecisionPayload,
  ) => Promise<Decision | null>
  updateDecision: (
    decisionId: string,
    payload: UpdateDecisionPayload,
  ) => Promise<Decision | null>
  evaluateDecision: (
    decisionId: string,
    payload: EvaluateDecisionPayload,
  ) => Promise<Decision | null>
  deleteDecision: (decisionId: string) => Promise<boolean>

  setSelectedDecision: (decision: Decision | null) => void
  clearSelectedDecision: () => void
  clearDecisions: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useDecisionsStore = create<DecisionsState>((set, get) => ({
  decisions: [],
  selectedDecision: null,
  isLoading: false,
  error: null,

  async fetchSessionDecisions(sessionId) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const decisions = await decisionsApi.getSessionDecisions(sessionId)

      set({
        decisions,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async fetchDecisionById(decisionId) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const decision = await decisionsApi.getDecisionById(decisionId)

      set({
        selectedDecision: decision,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async createDecision(sessionId, payload) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const decision = await decisionsApi.createDecision(sessionId, payload)

      set({
        decisions: [...get().decisions, decision],
        selectedDecision: decision,
        isLoading: false,
      })

      return decision
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateDecision(decisionId, payload) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const updatedDecision = await decisionsApi.updateDecision(
        decisionId,
        payload,
      )

      set({
        decisions: get().decisions.map((decision) =>
          decision.id === decisionId ? updatedDecision : decision,
        ),
        selectedDecision: updatedDecision,
        isLoading: false,
      })

      return updatedDecision
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async evaluateDecision(decisionId, payload) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const evaluatedDecision = await decisionsApi.evaluateDecision(
        decisionId,
        payload,
      )

      set({
        decisions: get().decisions.map((decision) =>
          decision.id === decisionId ? evaluatedDecision : decision,
        ),
        selectedDecision: evaluatedDecision,
        isLoading: false,
      })

      return evaluatedDecision
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async deleteDecision(decisionId) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      await decisionsApi.deleteDecision(decisionId)

      const selectedDecision = get().selectedDecision

      set({
        decisions: get().decisions.filter(
          (decision) => decision.id !== decisionId,
        ),
        selectedDecision:
          selectedDecision?.id === decisionId ? null : selectedDecision,
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

  setSelectedDecision(decision) {
    set({
      selectedDecision: decision,
    })
  },

  clearSelectedDecision() {
    set({
      selectedDecision: null,
    })
  },

  clearDecisions() {
    set({
      decisions: [],
    })
  },

  clearError() {
    set({
      error: null,
    })
  },
}))