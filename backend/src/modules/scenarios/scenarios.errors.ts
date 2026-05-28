export class ScenarioNotFoundError extends Error {
  constructor(scenarioId: string) {
    super(`Scenario with id ${scenarioId} not found`)
    this.name = 'ScenarioNotFoundError'
  }
}

export class ScenarioTaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Scenario task with id ${taskId} not found`)
    this.name = 'ScenarioTaskNotFoundError'
  }
}

export class ScenarioDirectionNotFoundError extends Error {
  constructor(directionId: string) {
    super(`Scenario direction with id ${directionId} not found`)
    this.name = 'ScenarioDirectionNotFoundError'
  }
}

export class ScenarioForbiddenError extends Error {
  constructor() {
    super('You do not have permission to perform this action')
    this.name = 'ScenarioForbiddenError'
  }
}

export class ScenarioHasActiveSessionsError extends Error {
  constructor() {
    super('Scenario cannot be deleted while it has active sessions')
    this.name = 'ScenarioHasActiveSessionsError'
  }
}