import type { CurrentUser } from '../../shared/types'

import {
  InvalidSessionStatusForRoleClassesError,
  RoleClassAlreadyAllowedError,
  RoleClassForbiddenError,
  RoleClassInUseError,
  RoleClassNotAllowedError,
  RoleClassNotFoundError,
  RoleClassValidationError,
  SessionForbiddenError,
  SessionNotFoundError,
} from './role-classes.errors'

import { roleClassesRepository } from './role-classes.repository'

import type {
  AllowRoleClassForSessionInput,
  CreateRoleClassInput,
  UpdateRoleClassInput,
} from './role-classes.schemas'

function canManageCatalog(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

function canManageSession(
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN'
    || (
      currentUser.role === 'MODERATOR'
      && session.moderatorId === currentUser.id
    )
  )
}

function canViewSession(
  session: {
    moderatorId: string
    participants: { userId: string }[]
    team: { members: { userId: string }[] } | null
  },
  currentUser: CurrentUser,
) {
  if (canManageSession(session, currentUser)) {
    return true
  }

  if (currentUser.role !== 'PARTICIPANT') {
    return false
  }

  const isParticipant = session.participants.some(
    (participant) => participant.userId === currentUser.id,
  )

  const isTeamMember = Boolean(
    session.team?.members.some((member) => member.userId === currentUser.id),
  )

  return isParticipant || isTeamMember
}

function assertCanManageCatalog(currentUser: CurrentUser) {
  if (!canManageCatalog(currentUser)) {
    throw new RoleClassForbiddenError()
  }
}

function assertSessionCanBeConfigured(session: {
  id: string
  status: string
}) {
  if (session.status !== 'PLANNED') {
    throw new InvalidSessionStatusForRoleClassesError(
      session.id,
      session.status,
    )
  }
}

async function assertRoleClassExists(roleClassId: string) {
  const roleClass = await roleClassesRepository.findById(roleClassId)

  if (!roleClass) {
    throw new RoleClassNotFoundError(roleClassId)
  }

  return roleClass
}

async function assertRoleClassCanBeDeleted(roleClassId: string) {
  const charactersCount =
    await roleClassesRepository.countCharactersByRoleClassId(roleClassId)

  const allowedSessionsCount =
    await roleClassesRepository.countAllowedSessionsByRoleClassId(roleClassId)

  if (charactersCount > 0 || allowedSessionsCount > 0) {
    throw new RoleClassInUseError(roleClassId)
  }
}

async function assertUniqueRoleClassName(name: string, currentId?: string) {
  const existing = await roleClassesRepository.findByName(name)

  if (existing && existing.id !== currentId) {
    throw new RoleClassValidationError(
      `Role class with name "${name}" already exists`,
    )
  }
}

export const roleClassesService = {
  async getRoleClasses(currentUser: CurrentUser) {
    assertCanManageCatalog(currentUser)

    return roleClassesRepository.findAll()
  },

  async getRoleClassById(roleClassId: string, currentUser: CurrentUser) {
    assertCanManageCatalog(currentUser)

    const roleClass = await roleClassesRepository.findById(roleClassId)

    if (!roleClass) {
      throw new RoleClassNotFoundError(roleClassId)
    }

    return roleClass
  },

  async createRoleClass(
    data: CreateRoleClassInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageCatalog(currentUser)
    await assertUniqueRoleClassName(data.name)

    return roleClassesRepository.create(data)
  },

  async updateRoleClass(
    roleClassId: string,
    data: UpdateRoleClassInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageCatalog(currentUser)

    const roleClass = await roleClassesRepository.findById(roleClassId)

    if (!roleClass) {
      throw new RoleClassNotFoundError(roleClassId)
    }

    if (data.name !== undefined) {
      await assertUniqueRoleClassName(data.name, roleClassId)
    }

    return roleClassesRepository.update(roleClassId, data)
  },

  async deleteRoleClass(roleClassId: string, currentUser: CurrentUser) {
    assertCanManageCatalog(currentUser)

    const roleClass = await roleClassesRepository.findById(roleClassId)

    if (!roleClass) {
      throw new RoleClassNotFoundError(roleClassId)
    }

    await assertRoleClassCanBeDeleted(roleClassId)

    return roleClassesRepository.delete(roleClassId)
  },

  async getSessionRoleClasses(sessionId: string, currentUser: CurrentUser) {
    const session = await roleClassesRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canViewSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    return roleClassesRepository.findSessionAllowedRoleClasses(sessionId)
  },

  async allowRoleClassForSession(
    sessionId: string,
    data: AllowRoleClassForSessionInput,
    currentUser: CurrentUser,
  ) {
    const session = await roleClassesRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canManageSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    assertSessionCanBeConfigured(session)
    await assertRoleClassExists(data.roleClassId)

    const existing = await roleClassesRepository.findSessionAllowedRoleClass(
      sessionId,
      data.roleClassId,
    )

    if (existing) {
      throw new RoleClassAlreadyAllowedError(sessionId, data.roleClassId)
    }

    return roleClassesRepository.createSessionAllowedRoleClass(
      sessionId,
      data.roleClassId,
    )
  },

  async removeRoleClassFromSession(
    sessionId: string,
    roleClassId: string,
    currentUser: CurrentUser,
  ) {
    const session = await roleClassesRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canManageSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    assertSessionCanBeConfigured(session)
    await assertRoleClassExists(roleClassId)

    const allowedRoleClass =
      await roleClassesRepository.findSessionAllowedRoleClass(
        sessionId,
        roleClassId,
      )

    if (!allowedRoleClass) {
      throw new RoleClassNotAllowedError(sessionId, roleClassId)
    }

    return roleClassesRepository.deleteSessionAllowedRoleClass(
      sessionId,
      roleClassId,
    )
  },
}