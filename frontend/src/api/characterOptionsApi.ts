import { httpClient } from './httpClient'
import type { CharacterOptions } from '../types/characterOptions'

export const characterOptionsApi = {
  getCharacterOptions(sessionId: string) {
    return httpClient.get<CharacterOptions>(
      `/sessions/${sessionId}/character-options`,
    )
  },
}