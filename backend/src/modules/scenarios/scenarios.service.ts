import { scenariosRepository } from './scenarios.repository'
import type {
  CreateScenarioInput,
  CreateScenarioTaskInput,
  UpdateScenarioInput,
} from './scenarios.schemas'
import {
  ScenarioForbiddenError,
  ScenarioNotFoundError,
  ScenarioTaskNotFoundError,
} from './scenarios.errors'

type CurrentUser = {
  id: string
  role?: string | null
}

function canManageScenarios(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

export const scenariosService = {
  async getScenarios() {
    return scenariosRepository.findMany()
  },

  async getScenarioById(id: string) {
    const scenario = await scenariosRepository.findById(id)

    if (!scenario) {
      throw new ScenarioNotFoundError(id)
    }

    return scenario
  },

  async createScenario(data: CreateScenarioInput, currentUser: CurrentUser) {
    if (!canManageScenarios(currentUser)) {
      throw new ScenarioForbiddenError()
    }

    return scenariosRepository.create(data, currentUser.id)
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

    return scenariosRepository.update(id, data)
  },

  async deleteScenario(id: string, currentUser: CurrentUser) {
    if (currentUser.role !== 'ADMIN') {
      throw new ScenarioForbiddenError()
    }

    const scenario = await scenariosRepository.findById(id)

    if (!scenario) {
      throw new ScenarioNotFoundError(id)
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

    const task = await scenariosRepository.findTaskById(taskId)

    if (!task || task.scenarioId !== scenarioId) {
      throw new ScenarioTaskNotFoundError(taskId)
    }

    return scenariosRepository.deleteTask(taskId)
  },
}