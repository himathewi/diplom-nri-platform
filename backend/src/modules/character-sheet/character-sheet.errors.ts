export class CharacterSheetError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CharacterSheetError'
  }
}

export class CharacterSheetNotFoundError extends CharacterSheetError {
  constructor(characterId: string) {
    super(`Character sheet for character with id "${characterId}" was not found`)
    this.name = 'CharacterSheetNotFoundError'
  }
}