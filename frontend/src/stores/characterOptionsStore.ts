import { create } from 'zustand'
import { characterOptionsApi } from '../api/characterOptionsApi'
import type { CharacterOptions } from '../types/characterOptions'

type CharacterOptionsState = {
  characterOptions: CharacterOptions | null
  isLoading: boolean
  error: string | null

  fetchCharacterOptions: (sessionId: string) => Promise<CharacterOptions | null>
  clearCharacterOptions: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useCharacterOptionsStore = create<CharacterOptionsState>((set) => ({
  characterOptions: null,
  isLoading: false,
  error: null,

  async fetchCharacterOptions(sessionId) {
    set({ isLoading: true, error: null })

    try {
      const characterOptions =
        await characterOptionsApi.getCharacterOptions(sessionId)

      set({
        characterOptions,
        isLoading: false,
      })

      return characterOptions
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  clearCharacterOptions() {
    set({ characterOptions: null })
  },

  clearError() {
    set({ error: null })
  },
}))