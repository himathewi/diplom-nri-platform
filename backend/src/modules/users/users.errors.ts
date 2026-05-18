export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} not found`)
    this.name = 'UserNotFoundError'
  }
}

export class UserEmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`)
    this.name = 'UserEmailAlreadyExistsError'
  }
}

export class UserForbiddenError extends Error {
  constructor() {
    super('You do not have permission to perform this action')
    this.name = 'UserForbiddenError'
  }
}