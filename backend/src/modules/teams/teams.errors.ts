export class TeamNotFoundError extends Error {
  constructor(teamId: string) {
    super(`Team with id ${teamId} not found`)
    this.name = 'TeamNotFoundError'
  }
}

export class TeamMemberAlreadyExistsError extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} is already a member of this team`)
    this.name = 'TeamMemberAlreadyExistsError'
  }
}

export class TeamMemberNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} is not a member of this team`)
    this.name = 'TeamMemberNotFoundError'
  }
}

export class TeamForbiddenError extends Error {
  constructor() {
    super('You do not have permission to perform this action')
    this.name = 'TeamForbiddenError'
  }
}