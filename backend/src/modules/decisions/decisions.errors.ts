export class DecisionNotFoundError extends Error {
  constructor(decisionId: string) {
    super(`Decision with id ${decisionId} not found`)
    this.name = 'DecisionNotFoundError'
  }
}

export class DecisionForbiddenError extends Error {
  constructor() {
    super('You do not have permission to perform this action with decisions')
    this.name = 'DecisionForbiddenError'
  }
}

export class DecisionSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} not found`)
    this.name = 'DecisionSessionNotFoundError'
  }
}

export class DecisionSessionNotActiveError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} is not active`)
    this.name = 'DecisionSessionNotActiveError'
  }
}

export class DecisionEventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Session event with id ${eventId} not found`)
    this.name = 'DecisionEventNotFoundError'
  }
}

export class DecisionEventSessionMismatchError extends Error {
  constructor() {
    super('Session event does not belong to this session')
    this.name = 'DecisionEventSessionMismatchError'
  }
}

export class DecisionCharacterNotFoundError extends Error {
  constructor(characterId: string) {
    super(`Character with id ${characterId} not found`)
    this.name = 'DecisionCharacterNotFoundError'
  }
}

export class DecisionCharacterNotParticipantError extends Error {
  constructor(characterId: string) {
    super(`Character with id ${characterId} is not a participant of this session`)
    this.name = 'DecisionCharacterNotParticipantError'
  }
}