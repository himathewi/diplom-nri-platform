export class ItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Item with id "${itemId}" was not found`)
    this.name = 'ItemNotFoundError'
  }
}

export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session with id "${sessionId}" was not found`)
    this.name = 'SessionNotFoundError'
  }
}

export class SessionForbiddenError extends Error {
  constructor() {
    super('You do not have access to this session')
    this.name = 'SessionForbiddenError'
  }
}

export class InvalidSessionStatusForItemsError extends Error {
  constructor(sessionId: string, status: string) {
    super(
      `Items can not be configured for session "${sessionId}" with status "${status}"`,
    )
    this.name = 'InvalidSessionStatusForItemsError'
  }
}

export class InvalidItemQuantityError extends Error {
  constructor(quantity: number) {
    super(`Item quantity must be greater than 0. Received: ${quantity}`)
    this.name = 'InvalidItemQuantityError'
  }
}

export class SessionAllowedItemAlreadyExistsError extends Error {
  constructor(sessionId: string, itemId: string) {
    super(`Item "${itemId}" is already allowed for session "${sessionId}"`)
    this.name = 'SessionAllowedItemAlreadyExistsError'
  }
}

export class SessionAllowedItemNotFoundError extends Error {
  constructor(sessionId: string, itemId: string) {
    super(`Allowed item "${itemId}" was not found for session "${sessionId}"`)
    this.name = 'SessionAllowedItemNotFoundError'
  }
}

export class SessionParticipantNotFoundError extends Error {
  constructor(participantId: string) {
    super(`Session participant with id "${participantId}" was not found`)
    this.name = 'SessionParticipantNotFoundError'
  }
}

export class ParticipantItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Participant item with id "${itemId}" was not found`)
    this.name = 'ParticipantItemNotFoundError'
  }
}

export class ParticipantItemForbiddenError extends Error {
  constructor() {
    super('You do not have access to this participant item')
    this.name = 'ParticipantItemForbiddenError'
  }
}

export class ItemNotAllowedForSessionError extends Error {
  constructor(sessionId: string, itemId: string) {
    super(`Item "${itemId}" is not allowed for session "${sessionId}"`)
    this.name = 'ItemNotAllowedForSessionError'
  }
}

export class CustomParticipantItemNameRequiredError extends Error {
  constructor() {
    super('nameSnapshot is required when itemId is not provided')
    this.name = 'CustomParticipantItemNameRequiredError'
  }
}