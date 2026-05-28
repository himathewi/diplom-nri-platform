export class SessionTaskNotFoundError extends Error {
  constructor(taskId?: string) {
    super(taskId ? `Session task with id ${taskId} not found` : 'Session task not found')
    this.name = 'SessionTaskNotFoundError'
  }
}

export class SessionTaskSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} not found`)
    this.name = 'SessionTaskSessionNotFoundError'
  }
}

export class SessionTaskForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action') {
    super(message)
    this.name = 'SessionTaskForbiddenError'
  }
}

export class SessionTaskSessionFinishedError extends Error {
  constructor(sessionId: string) {
    super(`Session ${sessionId} is already finished`)
    this.name = 'SessionTaskSessionFinishedError'
  }
}

export class SessionTaskTemplateNotFoundError extends Error {
  constructor(templateId: string) {
    super(`Task template with id ${templateId} not found`)
    this.name = 'SessionTaskTemplateNotFoundError'
  }
}

export class SessionTaskScenarioTaskNotFoundError extends Error {
  constructor(scenarioTaskId: string) {
    super(`Scenario task with id ${scenarioTaskId} not found`)
    this.name = 'SessionTaskScenarioTaskNotFoundError'
  }
}

export class SessionTaskScenarioMismatchError extends Error {
  constructor() {
    super('Scenario task does not belong to the session scenario')
    this.name = 'SessionTaskScenarioMismatchError'
  }
}

export class SessionTaskSourceConflictError extends Error {
  constructor() {
    super('Only one task source can be used at the same time')
    this.name = 'SessionTaskSourceConflictError'
  }
}

export class SessionTaskTitleRequiredError extends Error {
  constructor() {
    super('Task title is required for custom session task')
    this.name = 'SessionTaskTitleRequiredError'
  }
}

export class SessionTaskItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Item with id ${itemId} not found`)
    this.name = 'SessionTaskItemNotFoundError'
  }
}

export class SessionTaskSkillNotFoundError extends Error {
  constructor(skillId: string) {
    super(`Role class skill with id ${skillId} not found`)
    this.name = 'SessionTaskSkillNotFoundError'
  }
}

export class SessionTaskRequiredItemNotFoundError extends Error {
  constructor(taskId: string, itemId: string) {
    super(`Required item ${itemId} for session task ${taskId} not found`)
    this.name = 'SessionTaskRequiredItemNotFoundError'
  }
}

export class SessionTaskSkillAdvantageNotFoundError extends Error {
  constructor(taskId: string, roleSkillId: string) {
    super(`Skill advantage ${roleSkillId} for session task ${taskId} not found`)
    this.name = 'SessionTaskSkillAdvantageNotFoundError'
  }
}

export class SessionTaskDiceRollUnavailableError extends Error {
  constructor(taskId: string) {
    super(`Session task ${taskId} does not have a dice roll configured`)
    this.name = 'SessionTaskDiceRollUnavailableError'
  }
}

export class SessionTaskRollAlreadyExistsError extends Error {
  constructor(taskId: string) {
    super(`Current participant has already rolled for session task ${taskId}`)
    this.name = 'SessionTaskRollAlreadyExistsError'
  }
}

export class SessionTaskParticipantNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Current user is not a participant for session task ${taskId}`)
    this.name = 'SessionTaskParticipantNotFoundError'
  }
}

export class SessionTaskCharacterRequiredError extends Error {
  constructor(taskId: string) {
    super(`Current participant needs a character profile to roll for session task ${taskId}`)
    this.name = 'SessionTaskCharacterRequiredError'
  }
}
