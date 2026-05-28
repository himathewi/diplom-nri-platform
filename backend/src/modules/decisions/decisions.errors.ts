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

export class DecisionSessionTaskNotFoundError extends Error {
  constructor(sessionTaskId: string) {
    super(`Session task with id ${sessionTaskId} not found`)
    this.name = 'DecisionSessionTaskNotFoundError'
  }
}

export class DecisionSessionTaskMismatchError extends Error {
  constructor() {
    super('Session task does not belong to this session')
    this.name = 'DecisionSessionTaskMismatchError'
  }
}

export class DecisionSessionTaskHiddenError extends Error {
  constructor() {
    super('Session task is hidden for participants')
    this.name = 'DecisionSessionTaskHiddenError'
  }
}

export class DecisionSessionParticipantNotFoundError extends Error {
  constructor(participantId: string) {
    super(`Session participant with id ${participantId} not found`)
    this.name = 'DecisionSessionParticipantNotFoundError'
  }
}

export class DecisionUserNotSessionParticipantError extends Error {
  constructor() {
    super('Current user is not a participant of this session')
    this.name = 'DecisionUserNotSessionParticipantError'
  }
}

export class DecisionSessionParticipantMismatchError extends Error {
  constructor() {
    super('Session participant does not belong to this session')
    this.name = 'DecisionSessionParticipantMismatchError'
  }
}