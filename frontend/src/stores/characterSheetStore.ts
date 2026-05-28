import { create } from 'zustand'
import { getCharacterSheet } from '../api/characterSheetApi'
import type { CharacterSheet } from '../types/characterSheet'

type CharacterSheetStore = {
  currentSheet: CharacterSheet | null
  isLoading: boolean
  error: string | null
  fetchCharacterSheet: (characterId: string) => Promise<CharacterSheet | null>
  setCurrentSheet: (sheet: CharacterSheet | null) => void
  clearCurrentSheet: () => void
  refreshCurrentSheet: () => Promise<CharacterSheet | null>
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить ролевой профиль'
}

let latestSheetRequestId = 0

export const useCharacterSheetStore = create<CharacterSheetStore>(
  (set, get) => ({
    currentSheet: null,
    isLoading: false,
    error: null,

    fetchCharacterSheet: async (characterId: string) => {
      const requestId = ++latestSheetRequestId

      set({
        isLoading: true,
        error: null,
      })

      try {
        const sheet = await getCharacterSheet(characterId)

        if (requestId !== latestSheetRequestId) {
          return sheet
        }

        set({
          currentSheet: sheet,
          isLoading: false,
          error: null,
        })

        return sheet
      } catch (error) {
        if (requestId !== latestSheetRequestId) {
          throw error
        }

        set({
          currentSheet: null,
          isLoading: false,
          error: getErrorMessage(error),
        })

        throw error
      }
    },

    setCurrentSheet: (sheet: CharacterSheet | null) => {
      set({
        currentSheet: sheet,
        error: null,
      })
    },

    clearCurrentSheet: () => {
      set({
        currentSheet: null,
        isLoading: false,
        error: null,
      })
    },

    refreshCurrentSheet: async () => {
      const sheet = get().currentSheet

      if (!sheet) {
        return null
      }

      return get().fetchCharacterSheet(sheet.character.id)
    },
  })
)
