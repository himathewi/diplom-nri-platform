import type { ScenarioDomain } from './enums'

export type { ScenarioDomain } from './enums'

export type ScenarioCreator = {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

export type ScenarioTask = {
  id: string
  scenarioId: string
  title: string
  description: string
  taskType: string
  expectedResult: string | null
  createdAt: string
}

export type Scenario = {
  id: string
  title: string
  description: string
  domain: ScenarioDomain
  goal: string
  difficulty: number
  createdById: string
  createdBy: ScenarioCreator
  tasks: ScenarioTask[]
  createdAt: string
  updatedAt: string
}

export type CreateScenarioPayload = {
  title: string
  description: string
  domain: ScenarioDomain
  goal: string
  difficulty?: number
}

export type UpdateScenarioPayload = Partial<CreateScenarioPayload>

export type CreateScenarioTaskPayload = {
  title: string
  description: string
  taskType: string
  expectedResult?: string | null
}