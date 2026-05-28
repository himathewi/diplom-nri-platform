export class RoleClassNotFoundError extends Error {
  constructor(roleClassId: string) {
    super(`Role class with id "${roleClassId}" was not found`)
    this.name = 'RoleClassNotFoundError'
  }
}

export class RoleClassForbiddenError extends Error {
  constructor() {
    super('You do not have access to role classes')
    this.name = 'RoleClassForbiddenError'
  }
}

export class RoleClassValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RoleClassValidationError'
  }
}

export class RoleClassAlreadyAllowedError extends Error {
  constructor(sessionId: string, roleClassId: string) {
    super(`Role class "${roleClassId}" is already allowed for session "${sessionId}"`)
    this.name = 'RoleClassAlreadyAllowedError'
  }
}

export class RoleClassNotAllowedError extends Error {
  constructor(sessionId: string, roleClassId: string) {
    super(`Role class "${roleClassId}" is not allowed for session "${sessionId}"`)
    this.name = 'RoleClassNotAllowedError'
  }
}

export class RoleClassInUseError extends Error {
  constructor(roleClassId: string) {
    super(`Role class "${roleClassId}" is already used and can not be deleted`)
    this.name = 'RoleClassInUseError'
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

export class InvalidSessionStatusForRoleClassesError extends Error {
  constructor(sessionId: string, status: string) {
    super(
      `Role classes can not be configured for session "${sessionId}" with status "${status}"`,
    )
    this.name = 'InvalidSessionStatusForRoleClassesError'
  }
}