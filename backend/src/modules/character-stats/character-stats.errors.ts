export class CharacterStatsCharacterNotFoundError extends Error {
  constructor(characterId: string) {
    super(`Character with id "${characterId}" was not found`)
    this.name = 'CharacterStatsCharacterNotFoundError'
  }
}

export class CharacterStatsValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CharacterStatsValidationError'
  }
}