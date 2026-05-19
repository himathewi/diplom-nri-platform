export class TeamMetricNotFoundError extends Error {
  constructor(id: string) {
    super(`Team metric with id "${id}" was not found`)
    this.name = 'TeamMetricNotFoundError'
  }
}

export class TeamMetricSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session with id "${sessionId}" was not found`)
    this.name = 'TeamMetricSessionNotFoundError'
  }
}

export class TeamMetricAlreadyExistsError extends Error {
  constructor(sessionId: string) {
    super(`Team metric for session "${sessionId}" already exists`)
    this.name = 'TeamMetricAlreadyExistsError'
  }
}

export class TeamMetricForbiddenError extends Error {
  constructor() {
    super('You do not have permission to work with team metrics')
    this.name = 'TeamMetricForbiddenError'
  }
}

export class TeamMetricSessionNotReadyError extends Error {
  constructor(sessionId: string) {
    super(`Session "${sessionId}" is not ready for team metrics`)
    this.name = 'TeamMetricSessionNotReadyError'
  }
}