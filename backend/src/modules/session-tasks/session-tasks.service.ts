import { TaskType } from '@prisma/client'

import type { CurrentUser } from '../../shared/types'

import {
  SessionTaskForbiddenError,
  SessionTaskItemNotFoundError,
  SessionTaskNotFoundError,
  SessionTaskRequiredItemNotFoundError,
  SessionTaskScenarioMismatchError,
  SessionTaskScenarioTaskNotFoundError,
  SessionTaskSessionFinishedError,
  SessionTaskSessionNotFoundError,
  SessionTaskSourceConflictError,
  SessionTaskTemplateNotFoundError,
  SessionTaskTitleRequiredError,
} from './session-tasks.errors'

import { sessionTasksRepository } from './session-tasks.repository'

import type {
  AddSessionTaskRequiredItemInput,
  CreateSessionTaskInput,
  SessionTaskRequiredItemInput,
  UpdateSessionTaskInput,
} from './session-tasks.schemas'

type SessionForAccess = NonNullable<
  Awaited<ReturnType<typeof sessionTasksRepository.findSessionById>>
>

type SessionTaskEntity = NonNullable<
  Awaited<ReturnType<typeof sessionTasksRepository.findById>>
>

function canManageSession(
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  if (currentUser.role === 'ADMIN') {
    return true
  }

  return currentUser.role === 'MODERATOR' && session.moderatorId === currentUser.id
}

function canViewSession(session: SessionForAccess, currentUser: CurrentUser) {
  if (canManageSession(session, currentUser)) {
    return true
  }

  const isTeamMember = Boolean(
    session.team?.members.some((member) => member.userId === currentUser.id),
  )

  const isParticipant = session.participants.some(
    (participant) => participant.userId === currentUser.id,
  )

  return isTeamMember || isParticipant
}

function assertCanViewSession(session: SessionForAccess, currentUser: CurrentUser) {
  if (!canViewSession(session, currentUser)) {
    throw new SessionTaskForbiddenError()
  }
}

function assertCanViewTask(task: SessionTaskEntity, currentUser: CurrentUser) {
  if (canManageSession(task.session, currentUser)) {
    return
  }

  assertCanViewSession(task.session, currentUser)

  if (!task.isVisibleToParticipants) {
    throw new SessionTaskForbiddenError()
  }
}

function assertCanManageSession(
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  if (!canManageSession(session, currentUser)) {
    throw new SessionTaskForbiddenError()
  }
}

function assertSessionIsNotFinished(session: { id: string; status: string }) {
  if (session.status === 'FINISHED') {
    throw new SessionTaskSessionFinishedError(session.id)
  }
}

function assertOnlyOneSource(data: CreateSessionTaskInput) {
  if (data.scenarioTaskId && data.sourceTemplateId) {
    throw new SessionTaskSourceConflictError()
  }
}

function mergeRequiredItems(
  baseItems: SessionTaskRequiredItemInput[],
  overrideItems: SessionTaskRequiredItemInput[] | undefined,
) {
  if (!overrideItems) {
    return baseItems
  }

  const itemsById = new Map<string, SessionTaskRequiredItemInput>()

  for (const item of baseItems) {
    itemsById.set(item.itemId, item)
  }

  for (const item of overrideItems) {
    itemsById.set(item.itemId, item)
  }

  return Array.from(itemsById.values())
}

async function assertItemsExist(items: SessionTaskRequiredItemInput[]) {
  for (const item of items) {
    const existingItem = await sessionTasksRepository.findItemById(item.itemId)

    if (!existingItem || !existingItem.isActive) {
      throw new SessionTaskItemNotFoundError(item.itemId)
    }
  }
}

function toRequiredItemsFromSource(
  items: {
    itemId: string
    quantity: number
    notes: string | null
  }[],
): SessionTaskRequiredItemInput[] {
  return items.map((item) => ({
    itemId: item.itemId,
    quantity: item.quantity,
    notes: item.notes,
  }))
}

async function buildCreateData(
  session: SessionForAccess,
  data: CreateSessionTaskInput,
) {
  assertOnlyOneSource(data)

  if (data.sourceTemplateId) {
    const template = await sessionTasksRepository.findTaskTemplateById(
      data.sourceTemplateId,
    )

    if (!template || !template.isActive) {
      throw new SessionTaskTemplateNotFoundError(data.sourceTemplateId)
    }

    const requiredItems = mergeRequiredItems(
      toRequiredItemsFromSource(template.requiredItems),
      data.requiredItems,
    )

    await assertItemsExist(requiredItems)

    return {
      sessionId: session.id,
      sourceTemplateId: template.id,
      scenarioTaskId: null,
      title: data.title ?? template.title,
      descriptionForModerator:
        data.descriptionForModerator ?? template.moderatorNotes ?? null,
      descriptionForParticipants:
        data.descriptionForParticipants ?? template.description,
      taskType: data.taskType ?? template.taskType,
      difficulty: data.difficulty ?? template.difficulty,
      fatigueCost: data.fatigueCost ?? template.fatigueCost,
      isVisibleToParticipants: data.isVisibleToParticipants ?? false,
      requiredItems,
    }
  }

  if (data.scenarioTaskId) {
    const scenarioTask = await sessionTasksRepository.findScenarioTaskById(
      data.scenarioTaskId,
    )

    if (!scenarioTask) {
      throw new SessionTaskScenarioTaskNotFoundError(data.scenarioTaskId)
    }

    if (scenarioTask.scenarioId !== session.scenarioId) {
      throw new SessionTaskScenarioMismatchError()
    }

    const requiredItems = mergeRequiredItems(
      toRequiredItemsFromSource(scenarioTask.requiredItems),
      data.requiredItems,
    )

    await assertItemsExist(requiredItems)

    return {
      sessionId: session.id,
      scenarioTaskId: scenarioTask.id,
      sourceTemplateId: null,
      title: data.title ?? scenarioTask.title,
      descriptionForModerator:
        data.descriptionForModerator ?? scenarioTask.moderatorNotes ?? null,
      descriptionForParticipants:
        data.descriptionForParticipants ?? scenarioTask.description,
      taskType: data.taskType ?? scenarioTask.taskType,
      difficulty: data.difficulty ?? scenarioTask.difficulty,
      fatigueCost: data.fatigueCost ?? scenarioTask.fatigueCost,
      isVisibleToParticipants:
        data.isVisibleToParticipants ?? scenarioTask.isVisibleByDefault,
      requiredItems,
    }
  }

  if (!data.title) {
    throw new SessionTaskTitleRequiredError()
  }

  const requiredItems = data.requiredItems ?? []

  await assertItemsExist(requiredItems)

  return {
    sessionId: session.id,
    scenarioTaskId: null,
    sourceTemplateId: null,
    title: data.title,
    descriptionForModerator: data.descriptionForModerator ?? null,
    descriptionForParticipants: data.descriptionForParticipants ?? null,
    taskType: data.taskType ?? TaskType.MAIN,
    difficulty: data.difficulty ?? 1,
    fatigueCost: data.fatigueCost ?? 0,
    isVisibleToParticipants: data.isVisibleToParticipants ?? false,
    requiredItems,
  }
}

export const sessionTasksService = {
  async getSessionTasks(sessionId: string, currentUser: CurrentUser) {
    const session = await sessionTasksRepository.findSessionById(sessionId)

    if (!session) {
      throw new SessionTaskSessionNotFoundError(sessionId)
    }

    assertCanViewSession(session, currentUser)

    if (canManageSession(session, currentUser)) {
      return sessionTasksRepository.findManyBySessionId(sessionId)
    }

    return sessionTasksRepository.findVisibleManyBySessionId(sessionId)
  },

  async getSessionTaskById(taskId: string, currentUser: CurrentUser) {
    const task = await sessionTasksRepository.findById(taskId)

    if (!task) {
      throw new SessionTaskNotFoundError(taskId)
    }

    assertCanViewTask(task, currentUser)

    return task
  },

  async createSessionTask(
    sessionId: string,
    data: CreateSessionTaskInput,
    currentUser: CurrentUser,
  ) {
    const session = await sessionTasksRepository.findSessionById(sessionId)

    if (!session) {
      throw new SessionTaskSessionNotFoundError(sessionId)
    }

    assertCanManageSession(session, currentUser)
    assertSessionIsNotFinished(session)

    const createData = await buildCreateData(session, data)

    return sessionTasksRepository.create(createData)
  },

  async updateSessionTask(
    taskId: string,
    data: UpdateSessionTaskInput,
    currentUser: CurrentUser,
  ) {
    const task = await sessionTasksRepository.findById(taskId)

    if (!task) {
      throw new SessionTaskNotFoundError(taskId)
    }

    assertCanManageSession(task.session, currentUser)
    assertSessionIsNotFinished(task.session)

    return sessionTasksRepository.update(taskId, data)
  },

  async deleteSessionTask(taskId: string, currentUser: CurrentUser) {
    const task = await sessionTasksRepository.findById(taskId)

    if (!task) {
      throw new SessionTaskNotFoundError(taskId)
    }

    assertCanManageSession(task.session, currentUser)
    assertSessionIsNotFinished(task.session)

    return sessionTasksRepository.delete(taskId)
  },

  async addRequiredItem(
    taskId: string,
    data: AddSessionTaskRequiredItemInput,
    currentUser: CurrentUser,
  ) {
    const task = await sessionTasksRepository.findById(taskId)

    if (!task) {
      throw new SessionTaskNotFoundError(taskId)
    }

    assertCanManageSession(task.session, currentUser)
    assertSessionIsNotFinished(task.session)

    await assertItemsExist([data])

    return sessionTasksRepository.upsertRequiredItem(taskId, data)
  },

  async deleteRequiredItem(
    taskId: string,
    itemId: string,
    currentUser: CurrentUser,
  ) {
    const task = await sessionTasksRepository.findById(taskId)

    if (!task) {
      throw new SessionTaskNotFoundError(taskId)
    }

    assertCanManageSession(task.session, currentUser)
    assertSessionIsNotFinished(task.session)

    const requiredItem = await sessionTasksRepository.findRequiredItem(
      taskId,
      itemId,
    )

    if (!requiredItem) {
      throw new SessionTaskRequiredItemNotFoundError(taskId, itemId)
    }

    return sessionTasksRepository.deleteRequiredItem(taskId, itemId)
  },
}