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
  },
  currentUser: CurrentUser,
) {
  if (canManageTaskTemplates(currentUser)) {
    return true
  }

  return taskTemplate.isPublic && taskTemplate.isActive
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

async function assertItemExists(itemId: string) {
  const item = await taskTemplatesRepository.findItemById(itemId)

  if (!item || !item.isActive) {
    throw new TaskTemplateItemNotFoundError(itemId)
  }
}

export const taskTemplatesService = {
  async getTaskTemplates(currentUser: CurrentUser) {
    if (canManageTaskTemplates(currentUser)) {
      return taskTemplatesRepository.findManyForManager()
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

    return taskTemplatesRepository.create(data, currentUser.id)
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

    await assertDirectionExists(data.directionId)

    return taskTemplatesRepository.update(taskTemplateId, data)
  },

  async deleteTaskTemplate(taskTemplateId: string, currentUser: CurrentUser) {
    assertCanManageTaskTemplates(currentUser)

    const taskTemplate = await taskTemplatesRepository.findById(taskTemplateId)

    if (!taskTemplate) {
      throw new TaskTemplateNotFoundError(taskTemplateId)
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

    await assertItemExists(data.itemId)

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