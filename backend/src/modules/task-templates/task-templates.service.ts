import type { CurrentUser } from '../../shared/types'

import {
  TaskTemplateDirectionNotFoundError,
  TaskTemplateForbiddenError,
  TaskTemplateItemNotFoundError,
  TaskTemplateNotFoundError,
  TaskTemplateRequiredItemNotFoundError,
  TaskTemplateSkillAdvantageNotFoundError,
  TaskTemplateSkillNotFoundError,
} from './task-templates.errors'

import { taskTemplatesRepository } from './task-templates.repository'

import type {
  AddTaskTemplateRequiredItemInput,
  AddTaskTemplateSkillAdvantageInput,
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

function canReadRoleSkill(
  skill: {
    roleClass: {
      isPublic: boolean
      isActive: boolean
      createdById: string | null
    }
  },
  currentUser: CurrentUser,
) {
  if (!skill.roleClass.isActive) {
    return false
  }

  if (isAdmin(currentUser)) {
    return true
  }

  if (isModerator(currentUser)) {
    return (
      skill.roleClass.isPublic
      || skill.roleClass.createdById === currentUser.id
    )
  }

  return false
}

async function assertItemCanBeUsed(itemId: string, currentUser: CurrentUser) {
  const item = await taskTemplatesRepository.findItemById(itemId)

  if (!item || !canReadItem(item, currentUser)) {
    throw new TaskTemplateItemNotFoundError(itemId)
  }
}

async function assertRoleSkillCanBeUsed(
  roleSkillId: string,
  currentUser: CurrentUser,
) {
  const skill = await taskTemplatesRepository.findRoleSkillById(roleSkillId)

  if (!skill || !canReadRoleSkill(skill, currentUser)) {
    throw new TaskTemplateSkillNotFoundError(roleSkillId)
  }

  return skill
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

  async addSkillAdvantage(
    taskTemplateId: string,
    data: AddTaskTemplateSkillAdvantageInput,
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

    await assertRoleSkillCanBeUsed(data.roleSkillId, currentUser)

    return taskTemplatesRepository.upsertSkillAdvantage(taskTemplateId, data)
  },

  async deleteSkillAdvantage(
    taskTemplateId: string,
    roleSkillId: string,
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

    const advantage = await taskTemplatesRepository.findSkillAdvantage(
      taskTemplateId,
      roleSkillId,
    )

    if (!advantage) {
      throw new TaskTemplateSkillAdvantageNotFoundError(
        taskTemplateId,
        roleSkillId,
      )
    }

    return taskTemplatesRepository.deleteSkillAdvantage(
      taskTemplateId,
      roleSkillId,
    )
  },
}
