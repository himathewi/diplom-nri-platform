import { reportsRepository } from './reports.repository'
import type { CreateReportInput, UpdateReportInput } from './reports.schemas'
import {
  ReportAlreadyExistsError,
  ReportForbiddenError,
  ReportNotFoundError,
  ReportSessionNotFinishedError,
  ReportSessionNotFoundError,
} from './reports.errors'
import type { CurrentUser } from '../../shared/types'

type SessionForAccess = Awaited<ReturnType<typeof reportsRepository.findSessionById>>
type ReportForAccess = Awaited<ReturnType<typeof reportsRepository.findById>>

type SessionData = NonNullable<SessionForAccess>
type DecisionData = SessionData['decisions'][number]

type GeneratedReportData = {
  summary: string
  successfulActions?: string | null
  problemActions?: string | null
  recommendations?: string | null
}

function canManageReports(
  session: { moderatorId: string | null },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN' ||
    (currentUser.role === 'MODERATOR' && session.moderatorId === currentUser.id)
  )
}

function canViewAllReports(currentUser: CurrentUser) {
  return (
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MODERATOR' ||
    currentUser.role === 'EXPERT'
  )
}

function canViewSession(session: SessionData, currentUser: CurrentUser) {
  if (canViewAllReports(currentUser)) {
    return true
  }

  const isTeamMember = session.team?.members.some(
    (member) => member.userId === currentUser.id,
  )

  const isParticipant = session.participants.some(
    (participant) => participant.character.userId === currentUser.id,
  )

  return Boolean(isTeamMember || isParticipant)
}

function canViewReport(report: NonNullable<ReportForAccess>, currentUser: CurrentUser) {
  return canViewSession(report.session, currentUser)
}

function assertCanViewSession(session: SessionData, currentUser: CurrentUser) {
  if (!canViewSession(session, currentUser)) {
    throw new ReportForbiddenError()
  }
}

function assertCanManageReports(
  session: { moderatorId: string | null },
  currentUser: CurrentUser,
) {
  if (!canManageReports(session, currentUser)) {
    throw new ReportForbiddenError()
  }
}

function assertSessionFinished(session: { id: string; status: string }) {
  if (session.status !== 'FINISHED') {
    throw new ReportSessionNotFinishedError(session.id)
  }
}

function average(values: number[]) {
  if (values.length === 0) {
    return null
  }

  const sum = values.reduce((acc, value) => acc + value, 0)

  return Number((sum / values.length).toFixed(1))
}

function formatDecision(decision: DecisionData) {
  const author = decision.character?.name ?? decision.user?.name ?? 'участник'
  const result = decision.result ? ` Результат: ${decision.result}.` : ''
  const score =
    typeof decision.score === 'number' ? ` Оценка: ${decision.score}/100.` : ''

  return `${author}: ${decision.description}.${result}${score}`
}

function buildSuccessfulActions(session: SessionData) {
  const successfulDecisions = session.decisions.filter(
    (decision) => typeof decision.score === 'number' && decision.score >= 70,
  )

  if (successfulDecisions.length === 0) {
    return 'Успешные действия отдельно не выделены: в сессии отсутствуют решения с высокой оценкой.'
  }

  return successfulDecisions
    .map((decision, index) => `${index + 1}. ${formatDecision(decision)}`)
    .join('\n')
}

function buildProblemActions(session: SessionData) {
  const problemDecisions = session.decisions.filter(
    (decision) => typeof decision.score === 'number' && decision.score < 50,
  )

  const criticalEvents = session.events.filter((event) =>
    [
      'PRODUCTION_PROBLEM',
      'RESOURCE_LIMIT',
      'EQUIPMENT_FAILURE',
      'TEAM_CONFLICT',
    ].includes(event.eventType),
  )

  const parts: string[] = []

  if (problemDecisions.length > 0) {
    parts.push(
      problemDecisions
        .map((decision, index) => `${index + 1}. ${formatDecision(decision)}`)
        .join('\n'),
    )
  }

  if (criticalEvents.length > 0) {
    parts.push(
      `Критические события сессии:\n${criticalEvents
        .map((event, index) => `${index + 1}. ${event.title}: ${event.description}`)
        .join('\n')}`,
    )
  }

  if (parts.length === 0) {
    return 'Проблемные действия отдельно не зафиксированы.'
  }

  return parts.join('\n\n')
}

function buildRecommendations(session: SessionData) {
  const recommendations: string[] = []

  if (!session.metrics) {
    recommendations.push(
      'Добавить оценку командных метрик для более точного анализа командного взаимодействия.',
    )
  } else {
    if (session.metrics.communicationScore < 70) {
      recommendations.push(
        'Усилить коммуникацию внутри команды и заранее определить порядок обмена информацией.',
      )
    }

    if (session.metrics.decisionSpeedScore < 70) {
      recommendations.push(
        'Отработать скорость принятия решений в условиях ограниченного времени.',
      )
    }

    if (session.metrics.roleDistributionScore < 70) {
      recommendations.push(
        'Чётче распределять роли участников до начала сценарной сессии.',
      )
    }

    if (session.metrics.conflictResolutionScore < 70) {
      recommendations.push(
        'Разработать правила разрешения спорных ситуаций во время командной работы.',
      )
    }

    if (session.metrics.leadershipScore < 70) {
      recommendations.push(
        'Определить ответственного лидера или координатора команды на время сценария.',
      )
    }
  }

  const lowScoreDecisions = session.decisions.filter(
    (decision) => typeof decision.score === 'number' && decision.score < 50,
  )

  if (lowScoreDecisions.length > 0) {
    recommendations.push(
      'Разобрать решения с низкой оценкой и определить, какие данные или ресурсы были недоступны участникам.',
    )
  }

  if (session.events.some((event) => event.eventType === 'EQUIPMENT_FAILURE')) {
    recommendations.push(
      'Дополнительно отработать действия команды при сбоях оборудования или цифровых систем.',
    )
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Сохранить текущий подход к командному взаимодействию и использовать сценарий для повторной тренировки.',
    )
  }

  return recommendations.map((item, index) => `${index + 1}. ${item}`).join('\n')
}

function buildGeneratedReport(
  session: SessionData,
  data: CreateReportInput,
): GeneratedReportData {
  const decisionScores = session.decisions
    .map((decision) => decision.score)
    .filter((score): score is number => typeof score === 'number')

  const averageDecisionScore = average(decisionScores)

  const metricScores = session.metrics
    ? [
        session.metrics.communicationScore,
        session.metrics.decisionSpeedScore,
        session.metrics.roleDistributionScore,
        session.metrics.conflictResolutionScore,
        session.metrics.leadershipScore,
      ]
    : []

  const averageMetricScore = average(metricScores)

  const teamName = session.team?.name ?? 'без привязки к команде'
  const scenarioTitle = session.scenario.title

  const summary =
    data.summary ??
    [
      `Проведена настольно-ролевая сессия по сценарию "${scenarioTitle}" для команды "${teamName}".`,
      `В ходе сессии зафиксировано событий: ${session.events.length}.`,
      `Количество решений участников: ${session.decisions.length}.`,
      averageDecisionScore === null
        ? 'Оценки решений отсутствуют.'
        : `Средняя оценка решений: ${averageDecisionScore}/100.`,
      averageMetricScore === null
        ? 'Командные метрики отсутствуют.'
        : `Средняя оценка командного взаимодействия: ${averageMetricScore}/100.`,
    ].join(' ')

  return {
    summary,
    successfulActions:
      data.successfulActions ?? buildSuccessfulActions(session),
    problemActions:
      data.problemActions ?? buildProblemActions(session),
    recommendations:
      data.recommendations ?? buildRecommendations(session),
  }
}

export const reportsService = {
  async getSessionReport(sessionId: string, currentUser: CurrentUser) {
    const session = await reportsRepository.findSessionById(sessionId)

    if (!session) {
      throw new ReportSessionNotFoundError(sessionId)
    }

    assertCanViewSession(session, currentUser)

    const report = await reportsRepository.findBySessionId(sessionId)

    if (!report) {
      throw new ReportNotFoundError(sessionId)
    }

    return report
  },

  async getReportById(id: string, currentUser: CurrentUser) {
    const report = await reportsRepository.findById(id)

    if (!report) {
      throw new ReportNotFoundError(id)
    }

    if (!canViewReport(report, currentUser)) {
      throw new ReportForbiddenError()
    }

    return report
  },

  async createReport(
    sessionId: string,
    data: CreateReportInput,
    currentUser: CurrentUser,
  ) {
    const session = await reportsRepository.findSessionById(sessionId)

    if (!session) {
      throw new ReportSessionNotFoundError(sessionId)
    }

    assertCanManageReports(session, currentUser)
    assertSessionFinished(session)

    const existingReport = await reportsRepository.findBySessionId(sessionId)

    if (existingReport) {
      throw new ReportAlreadyExistsError(sessionId)
    }

    const reportData = buildGeneratedReport(session, data)

    return reportsRepository.create(sessionId, reportData)
  },

  async updateReport(
    id: string,
    data: UpdateReportInput,
    currentUser: CurrentUser,
  ) {
    const report = await reportsRepository.findById(id)

    if (!report) {
      throw new ReportNotFoundError(id)
    }

    assertCanManageReports(report.session, currentUser)
    assertSessionFinished(report.session)

    return reportsRepository.update(id, data)
  },

  async deleteReport(id: string, currentUser: CurrentUser) {
    const report = await reportsRepository.findById(id)

    if (!report) {
      throw new ReportNotFoundError(id)
    }

    assertCanManageReports(report.session, currentUser)
    assertSessionFinished(report.session)

    return reportsRepository.delete(id)
  },
}