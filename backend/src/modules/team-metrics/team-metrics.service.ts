import { teamMetricsRepository } from './team-metrics.repository'
import type {
  CreateTeamMetricInput,
  UpdateTeamMetricInput,
} from './team-metrics.schemas'
import {
  TeamMetricAlreadyExistsError,
  TeamMetricForbiddenError,
  TeamMetricNotFoundError,
  TeamMetricSessionNotFoundError,
  TeamMetricSessionNotReadyError,
} from './team-metrics.errors'
import type { CurrentUser } from '../../shared/types'

type SessionForAccess = Awaited<
  ReturnType<typeof teamMetricsRepository.findSessionById>
>

type TeamMetricForAccess = Awaited<
  ReturnType<typeof teamMetricsRepository.findById>
>

function canManageTeamMetrics(
  session: { moderatorId: string | null },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN' ||
    (currentUser.role === 'MODERATOR' && session.moderatorId === currentUser.id)
  )
}

function canViewAllTeamMetrics(currentUser: CurrentUser) {
  return (
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MODERATOR' ||
    currentUser.role === 'EXPERT'
  )
}

function canViewSession(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  if (canViewAllTeamMetrics(currentUser)) {
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

function canViewMetric(
  metric: NonNullable<TeamMetricForAccess>,
  currentUser: CurrentUser,
) {
  return canViewSession(metric.session, currentUser)
}

function assertCanViewSession(
  session: NonNullable<SessionForAccess>,
  currentUser: CurrentUser,
) {
  if (!canViewSession(session, currentUser)) {
    throw new TeamMetricForbiddenError()
  }
}

function assertCanManageTeamMetrics(
  session: { moderatorId: string | null },
  currentUser: CurrentUser,
) {
  if (!canManageTeamMetrics(session, currentUser)) {
    throw new TeamMetricForbiddenError()
  }
}

function assertSessionReadyForMetrics(session: NonNullable<SessionForAccess>) {
  if (session.status === 'PLANNED') {
    throw new TeamMetricSessionNotReadyError(session.id)
  }
}

export const teamMetricsService = {
  async getSessionMetric(sessionId: string, currentUser: CurrentUser) {
    const session = await teamMetricsRepository.findSessionById(sessionId)

    if (!session) {
      throw new TeamMetricSessionNotFoundError(sessionId)
    }

    assertCanViewSession(session, currentUser)

    const metric = await teamMetricsRepository.findBySessionId(sessionId)

    if (!metric) {
      throw new TeamMetricNotFoundError(sessionId)
    }

    return metric
  },

  async getMetricById(id: string, currentUser: CurrentUser) {
    const metric = await teamMetricsRepository.findById(id)

    if (!metric) {
      throw new TeamMetricNotFoundError(id)
    }

    if (!canViewMetric(metric, currentUser)) {
      throw new TeamMetricForbiddenError()
    }

    return metric
  },

  async createMetric(
    sessionId: string,
    data: CreateTeamMetricInput,
    currentUser: CurrentUser,
  ) {
    const session = await teamMetricsRepository.findSessionById(sessionId)

    if (!session) {
      throw new TeamMetricSessionNotFoundError(sessionId)
    }

    assertCanManageTeamMetrics(session, currentUser)
    assertSessionReadyForMetrics(session)

    const existingMetric = await teamMetricsRepository.findBySessionId(sessionId)

    if (existingMetric) {
      throw new TeamMetricAlreadyExistsError(sessionId)
    }

    return teamMetricsRepository.create(sessionId, data)
  },

  async updateMetric(
    id: string,
    data: UpdateTeamMetricInput,
    currentUser: CurrentUser,
  ) {
    const metric = await teamMetricsRepository.findById(id)

    if (!metric) {
      throw new TeamMetricNotFoundError(id)
    }

    assertCanManageTeamMetrics(metric.session, currentUser)
    assertSessionReadyForMetrics(metric.session)

    return teamMetricsRepository.update(id, data)
  },

  async deleteMetric(id: string, currentUser: CurrentUser) {
    const metric = await teamMetricsRepository.findById(id)

    if (!metric) {
      throw new TeamMetricNotFoundError(id)
    }

    assertCanManageTeamMetrics(metric.session, currentUser)
    assertSessionReadyForMetrics(metric.session)

    return teamMetricsRepository.delete(id)
  },
}
