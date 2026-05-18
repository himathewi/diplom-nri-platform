export class SessionEventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Session event with id ${eventId} not found`)
    this.name = 'SessionEventNotFoundError'
  }
}

export class SessionEventForbiddenError extends Error {
  constructor() {
    super('You do not have permission to perform this action with session events')
    this.name = 'SessionEventForbiddenError'
  }
}

export class SessionEventSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} not found`)
    this.name = 'SessionEventSessionNotFoundError'
  }
}

export class SessionEventSessionNotActiveError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} is not active`)
    this.name = 'SessionEventSessionNotActiveError'
  }
}

export class SessionEventSessionAlreadyFinishedError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} is already finished`)
    this.name = 'SessionEventSessionAlreadyFinishedError'
  }
}