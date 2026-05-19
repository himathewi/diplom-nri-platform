import { prisma } from '../../lib/prisma'
import type {
  CreateTeamMetricInput,
  UpdateTeamMetricInput,
} from './team-metrics.schemas'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

const sessionInclude = {
  team: {
    include: {
      members: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
  },
  moderator: {
    select: userSelect,
  },
  participants: {
    include: {
      character: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
  },
}

const metricInclude = {
  session: {
    include: sessionInclude,
  },
}

export const teamMetricsRepository = {
  findSessionById(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      include: sessionInclude,
    })
  },

  findBySessionId(sessionId: string) {
    return prisma.teamMetric.findUnique({
      where: {
        sessionId,
      },
      include: metricInclude,
    })
  },

  findById(id: string) {
    return prisma.teamMetric.findUnique({
      where: {
        id,
      },
      include: metricInclude,
    })
  },

  create(sessionId: string, data: CreateTeamMetricInput) {
    return prisma.teamMetric.create({
      data: {
        sessionId,
        communicationScore: data.communicationScore,
        decisionSpeedScore: data.decisionSpeedScore,
        roleDistributionScore: data.roleDistributionScore,
        conflictResolutionScore: data.conflictResolutionScore,
        leadershipScore: data.leadershipScore,
        comment: data.comment ?? null,
      },
      include: metricInclude,
    })
  },

  update(id: string, data: UpdateTeamMetricInput) {
    return prisma.teamMetric.update({
      where: {
        id,
      },
      data: {
        communicationScore: data.communicationScore,
        decisionSpeedScore: data.decisionSpeedScore,
        roleDistributionScore: data.roleDistributionScore,
        conflictResolutionScore: data.conflictResolutionScore,
        leadershipScore: data.leadershipScore,
        comment: data.comment,
      },
      include: metricInclude,
    })
  },

  delete(id: string) {
    return prisma.teamMetric.delete({
      where: {
        id,
      },
    })
  },
}