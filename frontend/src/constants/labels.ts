import type {
  ScenarioDomain,
  SessionEventType,
  SessionStatus,
  UserRole,
} from '../types/enums'

export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  MODERATOR: 'Модератор',
  PARTICIPANT: 'Участник',
}

export const sessionStatusLabels: Record<SessionStatus, string> = {
  PLANNED: 'Запланирована',
  ACTIVE: 'Активна',
  FINISHED: 'Завершена',
}

export const scenarioDomainLabels: Record<ScenarioDomain, string> = {
  CROP_PRODUCTION: 'Растениеводство',
  GREENHOUSE: 'Тепличное хозяйство',
  LIVESTOCK: 'Животноводство',
  LOGISTICS: 'Логистика',
  PROCESSING: 'Переработка продукции',
  ROBOTICS: 'Робототехника',
  TEAMBUILDING: 'Командное обучение',
}

export const sessionEventTypeLabels: Record<SessionEventType, string> = {
  PRODUCTION_PROBLEM: 'Производственная проблема',
  WEATHER_CHANGE: 'Изменение погодных условий',
  RESOURCE_LIMIT: 'Ограничение ресурсов',
  EQUIPMENT_FAILURE: 'Сбой оборудования',
  TEAM_CONFLICT: 'Командный конфликт',
  INFORMATION_UPDATE: 'Информационное обновление',
}

export const taskTypeLabels: Record<string, string> = {
  production_situation: 'Производственная ситуация',
  resource_distribution: 'Распределение ресурсов',
  team_decision: 'Командное решение',
  risk_response: 'Реакция на риск',
  technical_failure: 'Технический сбой',
}

export function getLabel<T extends string>(
  labels: Partial<Record<T, string>>,
  value: T,
) {
  return labels[value] ?? value
}