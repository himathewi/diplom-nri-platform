export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`)
    this.name = 'EmailAlreadyExistsError'
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

export class AuthUserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} not found`)
    this.name = 'AuthUserNotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}