import type { CurrentUser } from '../../shared/types'

import {
  TaskTemplateDirectionNotFoundError,
  TaskTemplateForbiddenError,
  TaskTemplateItemNotFoundError,
  TaskTemplateNotFoundError,
  TaskTemplateRequiredItemNotFoundError,
} from './task-templates.errors'

import { taskTemplatesRepository } from './task-templates.repository'

import type {
  AddTaskTemplateRequiredItemInput,
  CreateTaskTemplateInput,
  UpdateTaskTemplateInput,
} from './task-templates.schemas'

function isAdmin(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN'
}

function isModerator(currentUser: CurrentUser) {
  return currentUser.role === 'MODERATOR'
}

function canManageTaskTemplates(currentUser: CurrentUser) {
  return isAdmin(currentUser) || isModerator(currentUser)
}

function assertCanManageTaskTemplates(currentUser: CurrentUser) {
  if (!canManageTaskTemplates(currentUser)) {
    throw new TaskTemplateForbiddenError()
  }
}

function canReadTaskTemplate(
  taskTemplate: {
    isPublic: boolean
    isActive: boolean
    createdById: string | null
  },
  currentUser: CurrentUser,
) {
  if (isAdmin(currentUser)) {
    return true
  }

  if (isModerator(currentUser)) {
    return taskTemplate.isPublic || taskTemplate.createdById === currentUser.id
  }

  return taskTemplate.isPublic && taskTemplate.isActive
}

function canManageTaskTemplate(
  taskTemplate: {
    createdById: string | null
  },
  currentUser: CurrentUser,
) {
  return isAdmin(currentUser) || taskTemplate.createdById === currentUser.id
}

async function assertDirectionExists(directionId: string | null | undefined) {
  if (!directionId) {
    return
  }

  const direction = await taskTemplatesRepository.findDirectionById(directionId)

  if (!direction) {
    throw new TaskTemplateDirectionNotFoundError(directionId)
  }
}

function canReadItem(
  item: {
    isPublic: boolean
    isActive: boolean
    createdById: string | null
  },
  currentUser: CurrentUser,
) {
  if (!item.isActive) {
    return false
  }

  if (isAdmin(currentUser)) {
    return true
  }

  if (isModerator(currentUser)) {
    return item.isPublic || item.createdById === currentUser.id
  }

  return item.isPublic
}

async function assertItemCanBeUsed(itemId: string, currentUser: CurrentUser) {
  const item = await taskTemplatesRepository.findItemById(itemId)

  if (!item || !canReadItem(item, currentUser)) {
    throw new TaskTemplateItemNotFoundError(itemId)
  }
}

export const taskTemplatesService = {
  async getTaskTemplates(currentUser: CurrentUser) {
    if (isAdmin(currentUser)) {
      return taskTemplatesRepository.findManyForAdmin()
    }

    if (isModerator(currentUser)) {
      return taskTemplatesRepository.findManyForModerator(currentUser.id)
    }

    return taskTemplatesRepository.findManyForParticipant()
  },

  async getTaskTemplateById(taskTemplateId: string, currentUser: CurrentUser) {
    const taskTemplate = await taskTemplatesRepository.findById(taskTemplateId)

    if (!taskTemplate) {
      throw new TaskTemplateNotFoundError(taskTemplateId)
    }

    if (!canReadTaskTemplate(taskTemplate, currentUser)) {
      throw new TaskTemplateForbiddenError()
    }

    return taskTemplate
  },

  async createTaskTemplate(
    data: CreateTaskTemplateInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageTaskTemplates(currentUser)

    await assertDirectionExists(data.directionId)

    return taskTemplatesRepository.create(
      {
        ...data,
        isPublic: isAdmin(currentUser) ? data.isPublic : false,
      },
      currentUser.id,
    )
  },

  async updateTaskTemplate(
    taskTemplateId: string,
    data: UpdateTaskTemplateInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageTaskTemplates(currentUser)

    const taskTemplate = await taskTemplatesRepository.findById(taskTemplateId)

    if (!taskTemplate) {
      throw new TaskTemplateNotFoundError(taskTemplateId)
    }

    if (!canManageTaskTemplate(taskTemplate, currentUser)) {
      throw new TaskTemplateForbiddenError()
    }

    if (isModerator(currentUser) && data.isPublic === true) {
      throw new TaskTemplateForbiddenError()
    }

    await assertDirectionExists(data.directionId)

    return taskTemplatesRepository.update(taskTemplateId, {
      ...data,
      ...(isModerator(currentUser) && data.isPublic !== undefined
        ? { isPublic: false }
        : {}),
    })
  },

  async deleteTaskTemplate(taskTemplateId: string, currentUser: CurrentUser) {
    assertCanManageTaskTemplates(currentUser)

    const taskTemplate = await taskTemplatesRepository.findById(taskTemplateId)

    if (!taskTemplate) {
      throw new TaskTemplateNotFoundError(taskTemplateId)
    }

    if (!canManageTaskTemplate(taskTemplate, currentUser)) {
      throw new TaskTemplateForbiddenError()
    }

    return taskTemplatesRepository.deactivate(taskTemplateId)
  },

  async addRequiredItem(
    taskTemplateId: string,
    data: AddTaskTemplateRequiredItemInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageTaskTemplates(currentUser)

    const taskTemplate = await taskTemplatesRepository.findById(taskTemplateId)

    if (!taskTemplate) {
      throw new TaskTemplateNotFoundError(taskTemplateId)
    }

    if (!canManageTaskTemplate(taskTemplate, currentUser)) {
      throw new TaskTemplateForbiddenError()
    }

    await assertItemCanBeUsed(data.itemId, currentUser)

    return taskTemplatesRepository.upsertRequiredItem(taskTemplateId, data)
  },

  async deleteRequiredItem(
    taskTemplateId: string,
    itemId: string,
    currentUser: CurrentUser,
  ) {
    assertCanManageTaskTemplates(currentUser)

    const taskTemplate = await taskTemplatesRepository.findById(taskTemplateId)

    if (!taskTemplate) {
      throw new TaskTemplateNotFoundError(taskTemplateId)
    }

    if (!canManageTaskTemplate(taskTemplate, currentUser)) {
      throw new TaskTemplateForbiddenError()
    }

    const requiredItem = await taskTemplatesRepository.findRequiredItem(
      taskTemplateId,
      itemId,
    )

    if (!requiredItem) {
      throw new TaskTemplateRequiredItemNotFoundError(taskTemplateId, itemId)
    }

    return taskTemplatesRepository.deleteRequiredItem(taskTemplateId, itemId)
  },
}
