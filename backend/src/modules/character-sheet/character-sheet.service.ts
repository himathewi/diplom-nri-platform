import { CharacterNotFoundError } from '../characters/errors'

import { toCharacterSheetDto } from './character-sheet.mappers'

import type { CharacterRepository } from './character-sheet.contracts'
import type { CharacterSheetDto } from './character-sheet.types'

export class CharacterSheetService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    _unusedStatsRepository?: unknown,
    _unusedItemRepository?: unknown,
  ) {}

  async getCharacterSheet(characterId: string): Promise<CharacterSheetDto> {
    const character = await this.characterRepository.findByIdForSheet(
      characterId,
    )

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    return toCharacterSheetDto(character)
  }
}