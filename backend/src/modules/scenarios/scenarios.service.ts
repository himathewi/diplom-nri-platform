import type { CurrentUser } from '../../shared/types'
import {
  ScenarioDirectionNotFoundError,
  ScenarioForbiddenError,
  ScenarioHasActiveSessionsError,
  ScenarioNotFoundError,
  ScenarioTaskNotFoundError,
} from './scenarios.errors'
import { scenariosRepository } from './scenarios.repository'
import type {
  CreateScenarioInput,
  CreateScenarioTaskInput,
  UpdateScenarioInput,
} from './scenarios.schemas'

function canManageScenarios(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

function canViewScenario(
  scenario: {
    createdById: string
    isPublicTemplate: boolean
    sessions?: Array<{
      participants?: Array<{
        userId: string
      }>
    }>
  },
  currentUser: CurrentUser,
) {
  if (currentUser.role === 'ADMIN') {
    return true
  }

  if (currentUser.role === 'MODERATOR') {
    return scenario.isPublicTemplate || scenario.createdById === currentUser.id
  }

  if (scenario.isPublicTemplate) {
    return true
  }

  return scenario.sessions?.some((session) =>
    session.participants?.some(
      (participant) => participant.userId === currentUser.id,
    ),
  ) ?? false
}

function canEditScenario(
  scenario: {
    createdById: string
    sourceType: 'TEMPLATE' | 'CUSTOM'
    isPublicTemplate: boolean
  },
  currentUser: CurrentUser,
) {
  if (currentUser.role === 'ADMIN') {
    return true
  }

  if (currentUser.role !== 'MODERATOR') {
    return false
  }

  return (
    scenario.createdById === currentUser.id &&
    scenario.sourceType === 'CUSTOM' &&
    !scenario.isPublicTemplate
  )
}

function normalizeCreateScenarioInput(
  data: CreateScenarioInput,
  currentUser: CurrentUser,
): CreateScenarioInput {
  if (currentUser.role === 'MODERATOR') {
    if (data.sourceType === 'TEMPLATE' || data.isPublicTemplate === true) {
      throw new ScenarioForbiddenError()
    }

    return {
      ...data,
      sourceType: 'CUSTOM',
      isPublicTemplate: false,
    }
  }

  const sourceType = data.sourceType ?? 'CUSTOM'

  return {
    ...data,
    sourceType,
    isPublicTemplate:
      sourceType === 'TEMPLATE'
        ? data.isPublicTemplate ?? true
        : data.isPublicTemplate ?? false,
  }
}

async function ensureDirectionExists(directionId?: string | null) {
  if (!directionId) {
    return
  }

  const direction = await scenariosRepository.findDirectionById(directionId)

  if (!direction) {
    throw new ScenarioDirectionNotFoundError(directionId)
  }
}

export const scenariosService = {
  async getScenarios(currentUser: CurrentUser) {
    return scenariosRepository.findMany(currentUser)
  },

  async getScenarioById(id: string, currentUser: CurrentUser) {
    const scenario = await scenariosRepository.findById(id)

    if (!scenario) {
      throw new ScenarioNotFoundError(id)
    }

    if (!canViewScenario(scenario, currentUser)) {
      throw new ScenarioForbiddenError()
    }

    return scenario
  },

  async createScenario(data: CreateScenarioInput, currentUser: CurrentUser) {
    if (!canManageScenarios(currentUser)) {
      throw new ScenarioForbiddenError()
    }

    await ensureDirectionExists(data.directionId)

    const normalizedData = normalizeCreateScenarioInput(data, currentUser)

    return scenariosRepository.create(normalizedData, currentUser.id)
  },

  async updateScenario(
    id: string,
    data: UpdateScenarioInput,
    currentUser: CurrentUser,
  ) {
    if (!canManageScenarios(currentUser)) {
      throw new ScenarioForbiddenError()
    }

    const scenario = await scenariosRepository.findById(id)

    if (!scenario) {
      throw new ScenarioNotFoundError(id)
    }

    if (!canEditScenario(scenario, currentUser)) {
      throw new ScenarioForbiddenError()
    }

    if (
      currentUser.role === 'MODERATOR' &&
      (data.sourceType === 'TEMPLATE' || data.isPublicTemplate === true)
    ) {
      throw new ScenarioForbiddenError()
    }

    await ensureDirectionExists(data.directionId)

    return scenariosRepository.update(id, data)
  },

  async deleteScenario(id: string, currentUser: CurrentUser) {
    const scenario = await scenariosRepository.findById(id)

    if (!scenario) {
      throw new ScenarioNotFoundError(id)
    }

    if (!canEditScenario(scenario, currentUser)) {
      throw new ScenarioForbiddenError()
    }

    const activeSessionsCount =
      await scenariosRepository.countActiveSessions(id)

    if (activeSessionsCount > 0) {
      throw new ScenarioHasActiveSessionsError()
    }

    return scenariosRepository.delete(id)
  },

  async addTask(
    scenarioId: string,
    data: CreateScenarioTaskInput,
    currentUser: CurrentUser,
  ) {
    if (!canManageScenarios(currentUser)) {
      throw new ScenarioForbiddenError()
    }

    const scenario = await scenariosRepository.findById(scenarioId)

    if (!scenario) {
      throw new ScenarioNotFoundError(scenarioId)
    }

    if (!canEditScenario(scenario, currentUser)) {
      throw new ScenarioForbiddenError()
    }

    return scenariosRepository.addTask(scenarioId, data)
  },

  async deleteTask(
    scenarioId: string,
    taskId: string,
    currentUser: CurrentUser,
  ) {
    if (!canManageScenarios(currentUser)) {
      throw new ScenarioForbiddenError()
    }

    const scenario = await scenariosRepository.findById(scenarioId)

    if (!scenario) {
      throw new ScenarioNotFoundError(scenarioId)
    }

    if (!canEditScenario(scenario, currentUser)) {
      throw new ScenarioForbiddenError()
    }

    const task = await scenariosRepository.findTaskById(taskId)

    if (!task || task.scenarioId !== scenarioId) {
      throw new ScenarioTaskNotFoundError(taskId)
    }

    return scenariosRepository.deleteTask(taskId)
  },
} 