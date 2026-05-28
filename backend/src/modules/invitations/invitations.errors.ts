export class InvitationNotFoundError extends Error {
  constructor() {
    super('Invitation not found')
    this.name = 'InvitationNotFoundError'
  }
}

export class InvitationForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action') {
    super(message)
    this.name = 'InvitationForbiddenError'
  }
}

export class InvitationSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} not found`)
    this.name = 'InvitationSessionNotFoundError'
  }
}

export class InvitationInvalidSessionStatusError extends Error {
  constructor(sessionId: string, status: string) {
    super(`Invitations are available only for planned sessions. Session ${sessionId} has status ${status}`)
    this.name = 'InvitationInvalidSessionStatusError'
  }
}

export class InvitationExpiredError extends Error {
  constructor() {
    super('Invitation has expired')
    this.name = 'InvitationExpiredError'
  }
}

export class InvitationAlreadyUsedError extends Error {
  constructor() {
    super('Invitation has already been used')
    this.name = 'InvitationAlreadyUsedError'
  }
}

export class InvitationRevokedError extends Error {
  constructor() {
    super('Invitation has been revoked')
    this.name = 'InvitationRevokedError'
  }
}

export class InvitationParticipantAlreadyExistsError extends Error {
  constructor() {
    super('User is already a participant of this session')
    this.name = 'InvitationParticipantAlreadyExistsError'
  }
}

export class InvitationUserMismatchError extends Error {
  constructor() {
    super('This invitation is assigned to another user')
    this.name = 'InvitationUserMismatchError'
  }
}

export class InvitationCodeGenerationError extends Error {
  constructor() {
    super('Could not generate unique invitation code')
    this.name = 'InvitationCodeGenerationError'
  }
}