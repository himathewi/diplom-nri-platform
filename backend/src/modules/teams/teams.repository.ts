import { prisma } from '../../lib/prisma'
import type {
  AddTeamMemberInput,
  CreateTeamInput,
  UpdateTeamInput,
} from './teams.schemas'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

const teamInclude = {
  members: {
    include: {
      user: {
        select: userSelect,
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
}

export const teamsRepository = {
  findMany() {
    return prisma.team.findMany({
      include: teamInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findManyByUserId(userId: string) {
    return prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: teamInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  findById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: teamInclude,
    })
  },

  create(data: CreateTeamInput) {
    return prisma.team.create({
      data,
      include: teamInclude,
    })
  },

  update(id: string, data: UpdateTeamInput) {
    return prisma.team.update({
      where: { id },
      data,
      include: teamInclude,
    })
  },

  delete(id: string) {
    return prisma.team.delete({
      where: { id },
      include: teamInclude,
    })
  },

  findMember(teamId: string, userId: string) {
    return prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })
  },

  addMember(teamId: string, data: AddTeamMemberInput) {
    return prisma.teamMember.create({
      data: {
        teamId,
        userId: data.userId,
        roleInTeam: data.roleInTeam,
      },
      include: {
        user: {
          select: userSelect,
        },
      },
    })
  },

  removeMember(teamId: string, userId: string) {
    return prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })
  },
}