export class TaskTemplateNotFoundError extends Error {
  constructor(taskTemplateId?: string) {
    super(
      taskTemplateId
        ? `Task template with id ${taskTemplateId} not found`
        : 'Task template not found',
    )
    this.name = 'TaskTemplateNotFoundError'
  }
}

export class TaskTemplateForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action') {
    super(message)
    this.name = 'TaskTemplateForbiddenError'
  }
}

export class TaskTemplateDirectionNotFoundError extends Error {
  constructor(directionId: string) {
    super(`Scenario direction with id ${directionId} not found`)
    this.name = 'TaskTemplateDirectionNotFoundError'
  }
}

export class TaskTemplateItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Item with id ${itemId} not found`)
    this.name = 'TaskTemplateItemNotFoundError'
  }
}

export class TaskTemplateRequiredItemNotFoundError extends Error {
  constructor(taskTemplateId: string, itemId: string) {
    super(
      `Required item ${itemId} for task template ${taskTemplateId} not found`,
    )
    this.name = 'TaskTemplateRequiredItemNotFoundError'
  }
}