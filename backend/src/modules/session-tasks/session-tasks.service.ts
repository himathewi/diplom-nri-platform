import { TaskType } from '@prisma/client'

import type { CurrentUser } from '../../shared/types'

import {
  SessionTaskForbiddenError,
  SessionTaskCharacterRequiredError,
  SessionTaskDiceRollUnavailableError,
  SessionTaskItemNotFoundError,
  SessionTaskNotFoundError,
  SessionTaskParticipantNotFoundError,
  SessionTaskRequiredItemNotFoundError,
  SessionTaskRollAlreadyExistsError,
  SessionTaskScenarioMismatchError,
  SessionTaskScenarioTaskNotFoundError,
  SessionTaskSessionFinishedError,
  SessionTaskSessionNotFoundError,
  SessionTaskSkillAdvantageNotFoundError,
  SessionTaskSkillNotFoundError,
  SessionTaskSourceConflictError,
  SessionTaskTemplateNotFoundError,
  SessionTaskTitleRequiredError,
} from './session-tasks.errors'

import { sessionTasksRepository } from './session-tasks.repository'

import type {
  AddSessionTaskRequiredItemInput,
  AddSessionTaskSkillAdvantageInput,
  CreateSessionTaskInput,
  SessionTaskSkillAdvantageInput,
  SessionTaskRequiredItemInput,
  UpdateSessionTaskInput,
} from './session-tasks.schemas'

const D6_MIN = 1
const D6_MAX = 6

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

function assertSessionIsActive(session: { id: string; status: string }) {
  if (session.status !== 'ACTIVE') {
    throw new SessionTaskForbiddenError('Dice rolls are available only in active sessions')
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

function canReadTaskTemplate(
  taskTemplate: {
    isPublic: boolean
    isActive: boolean
    createdById: string | null
  },
  currentUser: CurrentUser,
) {
  if (!taskTemplate.isActive) {
    return false
  }

  if (currentUser.role === 'ADMIN') {
    return true
  }

  if (currentUser.role === 'MODERATOR') {
    return taskTemplate.isPublic || taskTemplate.createdById === currentUser.id
  }

  return taskTemplate.isPublic
}

function mergeSkillAdvantages(
  baseAdvantages: SessionTaskSkillAdvantageInput[],
  overrideAdvantages: SessionTaskSkillAdvantageInput[] | undefined,
) {
  if (!overrideAdvantages) {
    return baseAdvantages
  }

  const advantagesBySkillId = new Map<string, SessionTaskSkillAdvantageInput>()

  for (const advantage of baseAdvantages) {
    advantagesBySkillId.set(advantage.roleSkillId, advantage)
  }

  for (const advantage of overrideAdvantages) {
    advantagesBySkillId.set(advantage.roleSkillId, advantage)
  }

  return Array.from(advantagesBySkillId.values())
}

function canReadItemForSession(
  item: {
    isPublic: boolean
    isActive: boolean
    createdById: string | null
  },
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  if (!item.isActive) {
    return false
  }

  if (currentUser.role === 'ADMIN') {
    return true
  }

  if (currentUser.role === 'MODERATOR') {
    return item.isPublic || item.createdById === session.moderatorId
  }

  return item.isPublic
}

async function assertItemsCanBeUsed(
  items: SessionTaskRequiredItemInput[],
  session: SessionForAccess,
  currentUser: CurrentUser,
) {
  for (const item of items) {
    const existingItem = await sessionTasksRepository.findItemById(item.itemId)

    if (!existingItem || !canReadItemForSession(existingItem, session, currentUser)) {
      throw new SessionTaskItemNotFoundError(item.itemId)
    }
  }
}

function canReadRoleSkillForSession(
  skill: {
    roleClass: {
      isPublic: boolean
      isActive: boolean
      createdById: string | null
    }
  },
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  if (!skill.roleClass.isActive) {
    return false
  }

  if (currentUser.role === 'ADMIN') {
    return true
  }

  if (currentUser.role === 'MODERATOR') {
    return (
      skill.roleClass.isPublic ||
      skill.roleClass.createdById === session.moderatorId
    )
  }

  return false
}

async function assertSkillAdvantagesCanBeUsed(
  advantages: SessionTaskSkillAdvantageInput[],
  session: SessionForAccess,
  currentUser: CurrentUser,
) {
  for (const advantage of advantages) {
    const skill = await sessionTasksRepository.findRoleSkillById(
      advantage.roleSkillId,
    )

    if (!skill || !canReadRoleSkillForSession(skill, session, currentUser)) {
      throw new SessionTaskSkillNotFoundError(advantage.roleSkillId)
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

function toSkillAdvantagesFromSource(
  advantages: {
    roleSkillId: string
    benefitType: SessionTaskSkillAdvantageInput['benefitType']
    fatigueCostReduction: number
    notes: string | null
  }[],
): SessionTaskSkillAdvantageInput[] {
  return advantages.map((advantage) => ({
    roleSkillId: advantage.roleSkillId,
    benefitType: advantage.benefitType,
    fatigueCostReduction: advantage.fatigueCostReduction,
    notes: advantage.notes,
  }))
}

function rollD6() {
  return Math.floor(Math.random() * D6_MAX) + D6_MIN
}

function hasMatchingAdvantageSkill(task: SessionTaskEntity, roleClassId: string) {
  return task.advantageSkills.some(
    (advantage) =>
      advantage.roleSkill.roleClassId === roleClassId &&
      advantage.benefitType === 'ADVANTAGE',
  )
}

function calculateFatigueApplied(input: {
  rollValue: number
  isSuccess: boolean
  fatigueCost: number
}) {
  if (input.rollValue === D6_MIN) {
    return input.fatigueCost + 1
  }

  if (input.isSuccess) {
    return Math.floor(input.fatigueCost / 2)
  }

  return input.fatigueCost
}

async function buildCreateData(
  session: SessionForAccess,
  data: CreateSessionTaskInput,
  currentUser: CurrentUser,
) {
  assertOnlyOneSource(data)

  if (data.sourceTemplateId) {
    const template = await sessionTasksRepository.findTaskTemplateById(
      data.sourceTemplateId,
    )

    if (!template || !canReadTaskTemplate(template, currentUser)) {
      throw new SessionTaskTemplateNotFoundError(data.sourceTemplateId)
    }

    const requiredItems = mergeRequiredItems(
      toRequiredItemsFromSource(template.requiredItems),
      data.requiredItems,
    )
    const advantageSkills = mergeSkillAdvantages(
      toSkillAdvantagesFromSource(template.advantageSkills),
      data.advantageSkills,
    )

    await assertItemsCanBeUsed(requiredItems, session, currentUser)
    await assertSkillAdvantagesCanBeUsed(advantageSkills, session, currentUser)

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
      diceDifficulty: data.diceDifficulty ?? template.diceDifficulty,
      isVisibleToParticipants: data.isVisibleToParticipants ?? false,
      requiredItems,
      advantageSkills,
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
    const advantageSkills = mergeSkillAdvantages(
      toSkillAdvantagesFromSource(scenarioTask.advantageSkills),
      data.advantageSkills,
    )

    await assertItemsCanBeUsed(requiredItems, session, currentUser)
    await assertSkillAdvantagesCanBeUsed(advantageSkills, session, currentUser)

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
      diceDifficulty: data.diceDifficulty ?? scenarioTask.diceDifficulty,
      isVisibleToParticipants:
        data.isVisibleToParticipants ?? scenarioTask.isVisibleByDefault,
      requiredItems,
      advantageSkills,
    }
  }

  if (!data.title) {
    throw new SessionTaskTitleRequiredError()
  }

  const requiredItems = data.requiredItems ?? []
  const advantageSkills = data.advantageSkills ?? []

  await assertItemsCanBeUsed(requiredItems, session, currentUser)
  await assertSkillAdvantagesCanBeUsed(advantageSkills, session, currentUser)

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
    diceDifficulty: data.diceDifficulty ?? null,
    isVisibleToParticipants: data.isVisibleToParticipants ?? false,
    requiredItems,
    advantageSkills,
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

    const createData = await buildCreateData(session, data, currentUser)

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

    await assertItemsCanBeUsed([data], task.session, currentUser)

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

  async addSkillAdvantage(
    taskId: string,
    data: AddSessionTaskSkillAdvantageInput,
    currentUser: CurrentUser,
  ) {
    const task = await sessionTasksRepository.findById(taskId)

    if (!task) {
      throw new SessionTaskNotFoundError(taskId)
    }

    assertCanManageSession(task.session, currentUser)
    assertSessionIsNotFinished(task.session)
    await assertSkillAdvantagesCanBeUsed([data], task.session, currentUser)

    return sessionTasksRepository.upsertSkillAdvantage(taskId, data)
  },

  async deleteSkillAdvantage(
    taskId: string,
    roleSkillId: string,
    currentUser: CurrentUser,
  ) {
    const task = await sessionTasksRepository.findById(taskId)

    if (!task) {
      throw new SessionTaskNotFoundError(taskId)
    }

    assertCanManageSession(task.session, currentUser)
    assertSessionIsNotFinished(task.session)

    const advantage = await sessionTasksRepository.findSkillAdvantage(
      taskId,
      roleSkillId,
    )

    if (!advantage) {
      throw new SessionTaskSkillAdvantageNotFoundError(taskId, roleSkillId)
    }

    return sessionTasksRepository.deleteSkillAdvantage(taskId, roleSkillId)
  },

  async rollSessionTaskDice(taskId: string, currentUser: CurrentUser) {
    const task = await sessionTasksRepository.findById(taskId)

    if (!task) {
      throw new SessionTaskNotFoundError(taskId)
    }

    assertCanViewTask(task, currentUser)
    assertSessionIsActive(task.session)

    if (task.diceDifficulty === null) {
      throw new SessionTaskDiceRollUnavailableError(taskId)
    }

    if (currentUser.role !== 'PARTICIPANT') {
      throw new SessionTaskForbiddenError()
    }

    const participant =
      await sessionTasksRepository.findParticipantBySessionAndUser(
        task.sessionId,
        currentUser.id,
      )

    if (!participant) {
      throw new SessionTaskParticipantNotFoundError(taskId)
    }

    if (!participant.character) {
      throw new SessionTaskCharacterRequiredError(taskId)
    }

    const existingRoll = await sessionTasksRepository.findRollByTaskAndParticipant(
      taskId,
      participant.id,
    )

    if (existingRoll) {
      throw new SessionTaskRollAlreadyExistsError(taskId)
    }

    const hasAdvantage =
      participant.character.roleClassId !== null &&
      hasMatchingAdvantageSkill(task, participant.character.roleClassId)

    const rollValue = rollD6()
    const advantageRollValue = hasAdvantage ? rollD6() : null
    const effectiveRoll = Math.max(rollValue, advantageRollValue ?? rollValue)
    const isSuccess = effectiveRoll > task.diceDifficulty
    const fatigueApplied = calculateFatigueApplied({
      rollValue: effectiveRoll,
      isSuccess,
      fatigueCost: task.fatigueCost,
    })

    return sessionTasksRepository.createRollAndApplyFatigue({
      taskId,
      participantId: participant.id,
      characterId: participant.character.id,
      rollValue,
      advantageRollValue,
      effectiveRoll,
      diceDifficulty: task.diceDifficulty,
      isSuccess,
      fatigueApplied,
    })
  },
}
