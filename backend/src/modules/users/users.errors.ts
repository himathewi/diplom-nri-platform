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
  constructor(message = 'You do not have permission to perform this action') {
    super(message)
    this.name = 'UserForbiddenError'
  }
}

export class UserRoleUpdateForbiddenError extends UserForbiddenError {
  constructor() {
    super('Only admin can update user roles')
    this.name = 'UserRoleUpdateForbiddenError'
  }
}

export class UserAdminRoleProtectedError extends UserForbiddenError {
  constructor() {
    super('Admin role cannot be assigned or changed through users API')
    this.name = 'UserAdminRoleProtectedError'
  }
}

export class UserAdminDeleteForbiddenError extends UserForbiddenError {
  constructor() {
    super('Admin user cannot be deleted through users API')
    this.name = 'UserAdminDeleteForbiddenError'
  }
}