export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} not found`)
    this.name = 'SessionNotFoundError'
  }
}

export class SessionForbiddenError extends Error {
  constructor() {
    super('You do not have permission to perform this action')
    this.name = 'SessionForbiddenError'
  }
}

export class SessionAlreadyStartedError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} has already been started`)
    this.name = 'SessionAlreadyStartedError'
  }
}

export class SessionAlreadyFinishedError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} has already been finished`)
    this.name = 'SessionAlreadyFinishedError'
  }
}

export class SessionNotActiveError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} is not active`)
    this.name = 'SessionNotActiveError'
  }
}

export class ScenarioNotFoundForSessionError extends Error {
  constructor(scenarioId: string) {
    super(`Scenario with id ${scenarioId} not found`)
    this.name = 'ScenarioNotFoundForSessionError'
  }
}

export class TeamNotFoundForSessionError extends Error {
  constructor(teamId: string) {
    super(`Team with id ${teamId} not found`)
    this.name = 'TeamNotFoundForSessionError'
  }
}

export class CharacterNotFoundForSessionError extends Error {
  constructor(characterId: string) {
    super(`Character with id ${characterId} not found`)
    this.name = 'CharacterNotFoundForSessionError'
  }
}

export class SessionParticipantAlreadyExistsError extends Error {
  constructor(characterId: string) {
    super(`Character with id ${characterId} is already a participant of this session`)
    this.name = 'SessionParticipantAlreadyExistsError'
  }
}

export class SessionParticipantNotFoundError extends Error {
  constructor(participantId: string) {
    super(`Session participant with id ${participantId} not found`)
    this.name = 'SessionParticipantNotFoundError'
  }
}