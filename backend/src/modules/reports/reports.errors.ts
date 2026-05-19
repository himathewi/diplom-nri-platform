export class ReportNotFoundError extends Error {
  constructor(id: string) {
    super(`Report with id "${id}" was not found`)
    this.name = 'ReportNotFoundError'
  }
}

export class ReportSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session with id "${sessionId}" was not found`)
    this.name = 'ReportSessionNotFoundError'
  }
}

export class ReportAlreadyExistsError extends Error {
  constructor(sessionId: string) {
    super(`Report for session "${sessionId}" already exists`)
    this.name = 'ReportAlreadyExistsError'
  }
}

export class ReportForbiddenError extends Error {
  constructor() {
    super('You do not have permission to work with reports')
    this.name = 'ReportForbiddenError'
  }
}

export class ReportSessionNotFinishedError extends Error {
  constructor(sessionId: string) {
    super(`Session "${sessionId}" is not finished yet`)
    this.name = 'ReportSessionNotFinishedError'
  }
}